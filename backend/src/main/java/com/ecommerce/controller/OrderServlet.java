package com.ecommerce.controller;

import com.ecommerce.dao.OrderDao;
import com.ecommerce.model.Order;
import com.ecommerce.model.OrderItem;
import com.ecommerce.model.User;
import com.ecommerce.util.JsonUtil;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@WebServlet({"/api/orders", "/api/orders/*"})
public class OrderServlet extends HttpServlet {

    private final OrderDao orderDao = new OrderDao();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String pathInfo = request.getPathInfo();

        // 1. GET /api/orders/my-orders
        if (pathInfo != null && pathInfo.equals("/my-orders")) {
            Long authenticatedUserId = getAuthenticatedUserId(request);
            if (authenticatedUserId == null) {
                // Check query param if session is not shared
                String userIdParam = request.getParameter("userId");
                if (userIdParam != null && !userIdParam.trim().isEmpty()) {
                    try {
                        authenticatedUserId = Long.parseLong(userIdParam.trim());
                    } catch (NumberFormatException ignored) {}
                }
            }

            if (authenticatedUserId == null) {
                JsonUtil.sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "User authentication required");
                return;
            }

            List<Order> orders = orderDao.getOrdersByUserId(authenticatedUserId);
            JsonUtil.sendSuccessWithData(response, "Orders retrieved successfully", orders);
            return;
        }

        // 2. GET /api/orders/{orderId}
        if (pathInfo != null && pathInfo.length() > 1 && !pathInfo.contains("/cancel")) {
            try {
                String idStr = pathInfo.substring(1);
                long orderId = Long.parseLong(idStr);
                Order order = orderDao.getOrderById(orderId);
                if (order != null) {
                    JsonUtil.sendSuccessWithData(response, "Order details retrieved", order);
                } else {
                    JsonUtil.sendError(response, HttpServletResponse.SC_NOT_FOUND, "Order not found");
                }
                return;
            } catch (NumberFormatException ignored) {}
        }

        // 3. Fallback: GET /api/orders?userId=X
        String userIdParam = request.getParameter("userId");
        if (userIdParam != null && !userIdParam.trim().isEmpty()) {
            try {
                long userId = Long.parseLong(userIdParam.trim());
                List<Order> orders = orderDao.getOrdersByUserId(userId);
                JsonUtil.sendSuccessWithData(response, "Orders retrieved successfully", orders);
                return;
            } catch (NumberFormatException e) {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid userId format");
                return;
            }
        }

        JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid request. Provide /my-orders or /{orderId}");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String pathInfo = request.getPathInfo();

        // Cancel order: POST /api/orders/{orderId}/cancel
        if (pathInfo != null && pathInfo.contains("/cancel")) {
            try {
                String[] parts = pathInfo.split("/");
                long orderId = Long.parseLong(parts[1]);
                Long userId = getAuthenticatedUserId(request);
                if (userId == null) {
                    String userIdParam = request.getParameter("userId");
                    if (userIdParam != null) {
                        userId = Long.parseLong(userIdParam.trim());
                    }
                }
                if (userId == null) {
                    JsonObject body = JsonUtil.parseRequestBody(request);
                    if (body != null && body.has("userId")) {
                        userId = body.get("userId").getAsLong();
                    }
                }

                if (userId == null) {
                    JsonUtil.sendError(response, HttpServletResponse.SC_UNAUTHORIZED, "User authentication required to cancel order");
                    return;
                }

                boolean cancelled = orderDao.cancelOrder(orderId, userId);
                if (cancelled) {
                    Order updated = orderDao.getOrderById(orderId);
                    JsonUtil.sendSuccessWithData(response, "Order cancelled successfully", updated);
                } else {
                    JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Order could not be cancelled (already shipped or delivered)");
                }
                return;
            } catch (Exception e) {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid order cancellation request: " + e.getMessage());
                return;
            }
        }

        // Create order: POST /api/orders
        try {
            JsonObject body = JsonUtil.parseRequestBody(request);
            if (body == null || !body.has("items")) {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Missing items in order payload");
                return;
            }

            Long userId = null;
            if (body.has("userId") && !body.get("userId").isJsonNull()) {
                userId = body.get("userId").getAsLong();
            } else {
                userId = getAuthenticatedUserId(request);
            }

            if (userId == null || userId <= 0) {
                userId = 1L; // Fallback to primary customer account if not set
            }

            BigDecimal totalAmount = body.has("totalAmount") ? body.get("totalAmount").getAsBigDecimal() : BigDecimal.ZERO;
            String shippingAddress = body.has("shippingAddress") ? body.get("shippingAddress").getAsString() : "Default Address";
            String paymentMethod = body.has("paymentMethod") ? body.get("paymentMethod").getAsString() : "COD";
            String paymentId = body.has("paymentId") && !body.get("paymentId").isJsonNull() ? body.get("paymentId").getAsString() : null;

            JsonArray itemsArray = body.getAsJsonArray("items");
            List<OrderItem> items = new ArrayList<>();
            for (JsonElement elem : itemsArray) {
                JsonObject itemObj = elem.getAsJsonObject();
                OrderItem item = new OrderItem(
                        null,
                        null,
                        itemObj.get("productId").getAsLong(),
                        itemObj.has("productName") ? itemObj.get("productName").getAsString() : null,
                        itemObj.has("productImage") ? itemObj.get("productImage").getAsString() : (itemObj.has("image") ? itemObj.get("image").getAsString() : null),
                        itemObj.get("quantity").getAsInt(),
                        itemObj.has("price") ? itemObj.get("price").getAsBigDecimal() : BigDecimal.ZERO,
                        0,
                        itemObj.has("price") ? itemObj.get("price").getAsBigDecimal().multiply(BigDecimal.valueOf(itemObj.get("quantity").getAsInt())) : BigDecimal.ZERO
                );
                items.add(item);
            }

            Order created = orderDao.createOrder(userId, totalAmount, shippingAddress, paymentMethod, paymentId, items);
            if (created != null) {
                JsonUtil.sendSuccessWithData(response, "Order placed successfully", created);
            } else {
                JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to create order transaction");
            }
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error processing order: " + e.getMessage());
        }
    }

    private Long getAuthenticatedUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            Object userIdObj = session.getAttribute("userId");
            if (userIdObj instanceof Long) return (Long) userIdObj;
            Object userObj = session.getAttribute("user");
            if (userObj instanceof User) return ((User) userObj).getId();
        }
        return null;
    }
}
