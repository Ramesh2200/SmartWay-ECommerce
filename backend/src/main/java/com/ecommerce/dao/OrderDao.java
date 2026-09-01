package com.ecommerce.dao;

import com.ecommerce.config.DatabaseConnection;
import com.ecommerce.model.Order;
import com.ecommerce.model.OrderItem;

import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.logging.Level;
import java.util.logging.Logger;

public class OrderDao {

    private static final Logger LOGGER = Logger.getLogger(OrderDao.class.getName());
    private static final Random RANDOM = new Random();

    /**
     * Creates an order and order items within a single ACID database transaction.
     */
    public Order createOrder(long userId, BigDecimal clientTotal, String shippingAddress, String paymentMethod, String paymentId, List<OrderItem> items) {
        String generateOrderNum = generateOrderNumber();

        String orderSql = "INSERT INTO orders (order_number, user_id, status, subtotal, discount, shipping_fee, total_amount, payment_status, payment_method, payment_id, shipping_address, created_at, updated_at) " +
                          "VALUES (?, ?, 'CONFIRMED', ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
        String itemSql = "INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, unit_price, discount, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        String updateStockSql = "UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?";
        String restoreStockSql = "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?";

        Connection conn = null;
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false);

            BigDecimal subtotal = BigDecimal.ZERO;
            BigDecimal discount = BigDecimal.ZERO;
            BigDecimal shippingFee = BigDecimal.ZERO;

            // Fetch current product details from database for snapshots and backend price validation
            List<OrderItem> resolvedItems = new ArrayList<>();
            for (OrderItem item : items) {
                String prodSql = "SELECT p.id, p.name, p.price, p.original_price, p.discount, p.stock_quantity, pi.image_url " +
                                 "FROM products p LEFT JOIN product_images pi ON p.id = pi.product_id WHERE p.id = ? LIMIT 1";
                try (PreparedStatement prodStmt = conn.prepareStatement(prodSql)) {
                    prodStmt.setLong(1, item.getProductId());
                    try (ResultSet rs = prodStmt.executeQuery()) {
                        if (rs.next()) {
                            String pName = rs.getString("name");
                            BigDecimal pPrice = rs.getBigDecimal("price");
                            int pDiscount = rs.getInt("discount");
                            String pImage = rs.getString("image_url");

                            BigDecimal itemSubtotal = pPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                            subtotal = subtotal.add(itemSubtotal);

                            OrderItem resolved = new OrderItem(
                                    null,
                                    null,
                                    item.getProductId(),
                                    pName,
                                    pImage,
                                    item.getQuantity(),
                                    pPrice,
                                    pDiscount,
                                    itemSubtotal
                            );
                            resolvedItems.add(resolved);
                        } else {
                            // Fallback if product not found in products table
                            BigDecimal itemSubtotal = item.getUnitPrice() != null ? item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())) : BigDecimal.valueOf(100);
                            subtotal = subtotal.add(itemSubtotal);
                            resolvedItems.add(item);
                        }
                    }
                }
            }

            BigDecimal totalAmount = subtotal.subtract(discount).add(shippingFee);
            if (clientTotal != null && clientTotal.compareTo(BigDecimal.ZERO) > 0) {
                totalAmount = clientTotal; // Respect applied discounts or client total
            }

            String paymentStatus = "RAZORPAY".equalsIgnoreCase(paymentMethod) ? "PAID" : "PENDING";

            long orderId;
            try (PreparedStatement stmt = conn.prepareStatement(orderSql, Statement.RETURN_GENERATED_KEYS)) {
                stmt.setString(1, generateOrderNum);
                stmt.setLong(2, userId);
                stmt.setBigDecimal(3, subtotal);
                stmt.setBigDecimal(4, discount);
                stmt.setBigDecimal(5, shippingFee);
                stmt.setBigDecimal(6, totalAmount);
                stmt.setString(7, paymentStatus);
                stmt.setString(8, paymentMethod != null ? paymentMethod : "COD");
                stmt.setString(9, paymentId);
                stmt.setString(10, shippingAddress != null ? shippingAddress : "Default Address");
                stmt.executeUpdate();

                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        orderId = rs.getLong(1);
                    } else {
                        conn.rollback();
                        return null;
                    }
                }
            }

            // Insert snapshot items and update stock
            try (PreparedStatement itemStmt = conn.prepareStatement(itemSql);
                 PreparedStatement stockStmt = conn.prepareStatement(updateStockSql)) {
                for (OrderItem item : resolvedItems) {
                    itemStmt.setLong(1, orderId);
                    itemStmt.setLong(2, item.getProductId());
                    itemStmt.setString(3, item.getProductName() != null ? item.getProductName() : "Product #" + item.getProductId());
                    itemStmt.setString(4, item.getProductImage());
                    itemStmt.setInt(5, item.getQuantity());
                    itemStmt.setBigDecimal(6, item.getUnitPrice());
                    itemStmt.setInt(7, item.getDiscount());
                    itemStmt.setBigDecimal(8, item.getSubtotal());
                    itemStmt.addBatch();

                    stockStmt.setInt(1, item.getQuantity());
                    stockStmt.setLong(2, item.getProductId());
                    stockStmt.addBatch();
                }
                itemStmt.executeBatch();
                stockStmt.executeBatch();
            }

            conn.commit();
            return getOrderById(orderId);
        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ignored) {}
            }
            LOGGER.log(Level.SEVERE, "Error creating order transaction: " + e.getMessage(), e);
            return null;
        } finally {
            if (conn != null) {
                try { conn.setAutoCommit(true); conn.close(); } catch (SQLException ignored) {}
            }
        }
    }

    public Order getOrderById(long orderId) {
        String sql = "SELECT id, order_number, user_id, status, subtotal, discount, shipping_fee, total_amount, payment_status, payment_method, payment_id, shipping_address, created_at, updated_at FROM orders WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, orderId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Order order = mapOrderRow(rs);
                    order.setItems(getOrderItems(orderId));
                    return order;
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching order by id: " + e.getMessage(), e);
        }
        return null;
    }

    public List<Order> getOrdersByUserId(long userId) {
        List<Order> orders = new ArrayList<>();
        String sql = "SELECT id, order_number, user_id, status, subtotal, discount, shipping_fee, total_amount, payment_status, payment_method, payment_id, shipping_address, created_at, updated_at FROM orders WHERE user_id = ? ORDER BY id DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Order order = mapOrderRow(rs);
                    order.setItems(getOrderItems(order.getId()));
                    orders.add(order);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching user orders: " + e.getMessage(), e);
        }
        return orders;
    }

    public boolean cancelOrder(long orderId, long userId) {
        String checkSql = "SELECT status FROM orders WHERE id = ? AND user_id = ?";
        String updateSql = "UPDATE orders SET status = 'CANCELLED', updated_at = NOW() WHERE id = ?";
        String getItemsSql = "SELECT product_id, quantity FROM order_items WHERE order_id = ?";
        String restoreStockSql = "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?";

        Connection conn = null;
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false);

            try (PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
                checkStmt.setLong(1, orderId);
                checkStmt.setLong(2, userId);
                try (ResultSet rs = checkStmt.executeQuery()) {
                    if (!rs.next()) {
                        conn.rollback();
                        return false;
                    }
                    String currentStatus = rs.getString("status");
                    if ("CANCELLED".equalsIgnoreCase(currentStatus) || "DELIVERED".equalsIgnoreCase(currentStatus)) {
                        conn.rollback();
                        return false; // Not eligible for cancellation
                    }
                }
            }

            try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                updateStmt.setLong(1, orderId);
                updateStmt.executeUpdate();
            }

            // Restore product stock
            try (PreparedStatement itemsStmt = conn.prepareStatement(getItemsSql);
                 PreparedStatement restoreStmt = conn.prepareStatement(restoreStockSql)) {
                itemsStmt.setLong(1, orderId);
                try (ResultSet rs = itemsStmt.executeQuery()) {
                    while (rs.next()) {
                        restoreStmt.setInt(1, rs.getInt("quantity"));
                        restoreStmt.setLong(2, rs.getLong("product_id"));
                        restoreStmt.addBatch();
                    }
                }
                restoreStmt.executeBatch();
            }

            conn.commit();
            return true;
        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ignored) {}
            }
            LOGGER.log(Level.SEVERE, "Error cancelling order: " + e.getMessage(), e);
            return false;
        } finally {
            if (conn != null) {
                try { conn.setAutoCommit(true); conn.close(); } catch (SQLException ignored) {}
            }
        }
    }

    private List<OrderItem> getOrderItems(long orderId) {
        List<OrderItem> items = new ArrayList<>();
        String sql = "SELECT oi.id, oi.order_id, oi.product_id, oi.product_name, oi.product_image, oi.quantity, oi.unit_price, oi.discount, oi.subtotal, pi.image_url AS live_image " +
                     "FROM order_items oi LEFT JOIN product_images pi ON oi.product_id = pi.product_id WHERE oi.order_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, orderId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String img = rs.getString("product_image");
                    if (img == null || img.isEmpty()) {
                        img = rs.getString("live_image");
                    }
                    OrderItem item = new OrderItem(
                            rs.getLong("id"),
                            rs.getLong("order_id"),
                            rs.getLong("product_id"),
                            rs.getString("product_name"),
                            img,
                            rs.getInt("quantity"),
                            rs.getBigDecimal("unit_price"),
                            rs.getInt("discount"),
                            rs.getBigDecimal("subtotal")
                    );
                    items.add(item);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching order items: " + e.getMessage(), e);
        }
        return items;
    }

    private Order mapOrderRow(ResultSet rs) throws SQLException {
        return new Order(
                rs.getLong("id"),
                rs.getString("order_number"),
                rs.getLong("user_id"),
                rs.getString("status"),
                rs.getBigDecimal("subtotal"),
                rs.getBigDecimal("discount"),
                rs.getBigDecimal("shipping_fee"),
                rs.getBigDecimal("total_amount"),
                rs.getString("payment_status"),
                rs.getString("payment_method"),
                rs.getString("payment_id"),
                rs.getString("shipping_address"),
                rs.getTimestamp("created_at"),
                rs.getTimestamp("updated_at")
        );
    }

    private String generateOrderNumber() {
        String dateStr = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        int rand = 100000 + RANDOM.nextInt(900000);
        return "SW-" + dateStr + "-" + rand;
    }
}
