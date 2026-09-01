package com.ecommerce.dao;

import com.ecommerce.config.DatabaseConnection;
import com.ecommerce.model.Product;
import com.ecommerce.model.ProductFilterOptions;

import java.math.BigDecimal;
import java.sql.*;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ProductDao {

    private static final Logger LOGGER = Logger.getLogger(ProductDao.class.getName());

    public List<Product> getProducts(String search, String category, String subcategory, String brandList,
                                    BigDecimal minPrice, BigDecimal maxPrice, Double minRating,
                                    Integer minDiscount, String availability, String offer,
                                    String sort, Integer page, Integer limit) {
        List<Product> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder();
        sql.append("SELECT p.id, p.name, p.slug, p.description, p.price, p.original_price, p.discount, ")
           .append("p.rating, p.review_count, p.stock_quantity, p.sku, p.featured, p.best_seller, p.created_at, ")
           .append("c.name AS category_name, c.slug AS category_slug, ")
           .append("s.name AS subcategory_name, b.name AS brand_name, ")
           .append("(SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order ASC LIMIT 1) AS main_image ")
           .append("FROM products p ")
           .append("JOIN categories c ON p.category_id = c.id ")
           .append("LEFT JOIN subcategories s ON p.subcategory_id = s.id ")
           .append("LEFT JOIN brands b ON p.brand_id = b.id ")
           .append("WHERE 1=1 ");

        List<Object> params = new ArrayList<>();

        // 1. Search filter
        if (search != null && !search.trim().isEmpty()) {
            sql.append("AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(b.name) LIKE ? OR LOWER(c.name) LIKE ? OR LOWER(s.name) LIKE ?) ");
            String term = "%" + search.trim().toLowerCase() + "%";
            for (int i = 0; i < 5; i++) params.add(term);
        }

        // 2. Category filter
        if (category != null && !category.trim().isEmpty() && !category.equalsIgnoreCase("All")) {
            sql.append("AND (LOWER(c.name) = ? OR LOWER(c.slug) = ?) ");
            params.add(category.trim().toLowerCase());
            params.add(category.trim().toLowerCase());
        }

        // 3. Subcategory filter
        if (subcategory != null && !subcategory.trim().isEmpty() && !subcategory.equalsIgnoreCase("All")) {
            sql.append("AND LOWER(s.name) = ? ");
            params.add(subcategory.trim().toLowerCase());
        }

        // 4. Brand filter (supports comma-separated multiple brands for OR logic!)
        if (brandList != null && !brandList.trim().isEmpty() && !brandList.equalsIgnoreCase("All")) {
            String[] brands = brandList.split(",");
            sql.append("AND (");
            for (int i = 0; i < brands.length; i++) {
                if (i > 0) sql.append(" OR ");
                sql.append("LOWER(b.name) = ?");
                params.add(brands[i].trim().toLowerCase());
            }
            sql.append(") ");
        }

        // 5. Price range
        if (minPrice != null) {
            sql.append("AND p.price >= ? ");
            params.add(minPrice);
        }
        if (maxPrice != null) {
            sql.append("AND p.price <= ? ");
            params.add(maxPrice);
        }

        // 6. Rating
        if (minRating != null && minRating > 0) {
            sql.append("AND p.rating >= ? ");
            params.add(BigDecimal.valueOf(minRating));
        }

        // 7. Discount
        if (minDiscount != null && minDiscount > 0) {
            sql.append("AND p.discount >= ? ");
            params.add(minDiscount);
        }

        // 8. Availability
        if (availability != null && !availability.trim().isEmpty() && !availability.equalsIgnoreCase("all")) {
            if (availability.equalsIgnoreCase("inStock")) {
                sql.append("AND p.stock_quantity > 0 ");
            } else if (availability.equalsIgnoreCase("outOfStock")) {
                sql.append("AND p.stock_quantity <= 0 ");
            }
        }

        // 9. Offers
        if (offer != null && !offer.trim().isEmpty()) {
            if (offer.equalsIgnoreCase("deals")) {
                sql.append("AND p.discount > 0 ");
            } else if (offer.equalsIgnoreCase("featured")) {
                sql.append("AND p.featured = 1 ");
            } else if (offer.equalsIgnoreCase("bestSeller")) {
                sql.append("AND p.best_seller = 1 ");
            }
        }

        // 10. Sorting
        if (sort != null && !sort.trim().isEmpty()) {
            switch (sort.toLowerCase()) {
                case "pricelow":
                case "price-low":
                    sql.append("ORDER BY p.price ASC ");
                    break;
                case "pricehigh":
                case "price-high":
                    sql.append("ORDER BY p.price DESC ");
                    break;
                case "rating":
                    sql.append("ORDER BY p.rating DESC, p.review_count DESC ");
                    break;
                case "discount":
                    sql.append("ORDER BY p.discount DESC ");
                    break;
                case "newest":
                    sql.append("ORDER BY p.created_at DESC, p.id DESC ");
                    break;
                case "popular":
                case "bestseller":
                    sql.append("ORDER BY p.best_seller DESC, p.review_count DESC ");
                    break;
                default:
                    sql.append("ORDER BY p.featured DESC, p.id ASC ");
                    break;
            }
        } else {
            sql.append("ORDER BY p.featured DESC, p.id ASC ");
        }

        // 11. Pagination
        if (limit != null && limit > 0) {
            sql.append("LIMIT ? ");
            params.add(limit);
            if (page != null && page > 1) {
                sql.append("OFFSET ? ");
                params.add((page - 1) * limit);
            }
        }

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Product p = mapProduct(rs);
                    list.add(p);
                }
            }

            // Populate gallery images for each product
            if (!list.isEmpty()) {
                populateProductImages(conn, list);
            }

        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error querying products: " + e.getMessage(), e);
        }

        return list;
    }

    public Product getProductById(long id) {
        String sql = "SELECT p.id, p.name, p.slug, p.description, p.price, p.original_price, p.discount, " +
                "p.rating, p.review_count, p.stock_quantity, p.sku, p.featured, p.best_seller, p.created_at, " +
                "c.name AS category_name, c.slug AS category_slug, " +
                "s.name AS subcategory_name, b.name AS brand_name, " +
                "(SELECT image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order ASC LIMIT 1) AS main_image " +
                "FROM products p " +
                "JOIN categories c ON p.category_id = c.id " +
                "LEFT JOIN subcategories s ON p.subcategory_id = s.id " +
                "LEFT JOIN brands b ON p.brand_id = b.id " +
                "WHERE p.id = ?";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Product p = mapProduct(rs);
                    populateProductImages(conn, Collections.singletonList(p));
                    return p;
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error fetching product by ID: " + e.getMessage(), e);
        }
        return null;
    }

    public ProductFilterOptions getFilterOptions(String selectedCategory) {
        ProductFilterOptions options = new ProductFilterOptions();

        try (Connection conn = DatabaseConnection.getConnection()) {
            // 1. Total product count
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM products")) {
                if (rs.next()) {
                    options.setTotalProducts(rs.getInt(1));
                }
            }

            // 2. Categories with actual product counts
            String catSql = "SELECT c.id, c.name, c.slug, COUNT(p.id) AS prod_count " +
                    "FROM categories c " +
                    "LEFT JOIN products p ON c.id = p.category_id " +
                    "GROUP BY c.id, c.name, c.slug " +
                    "ORDER BY c.name ASC";
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(catSql)) {
                while (rs.next()) {
                    options.getCategories().add(new ProductFilterOptions.CategoryOption(
                            rs.getLong("id"),
                            rs.getString("name"),
                            rs.getString("slug"),
                            rs.getInt("prod_count")
                    ));
                }
            }

            // 3. Subcategories with product counts (filtered by selected category if provided)
            StringBuilder subcatSql = new StringBuilder(
                    "SELECT s.id, s.category_id, c.name AS category_name, s.name, COUNT(p.id) AS prod_count " +
                    "FROM subcategories s " +
                    "JOIN categories c ON s.category_id = c.id " +
                    "LEFT JOIN products p ON s.id = p.subcategory_id ");
            if (selectedCategory != null && !selectedCategory.trim().isEmpty() && !selectedCategory.equalsIgnoreCase("All")) {
                subcatSql.append("WHERE LOWER(c.name) = ? OR LOWER(c.slug) = ? ");
            }
            subcatSql.append("GROUP BY s.id, s.category_id, c.name, s.name ORDER BY s.name ASC");

            try (PreparedStatement stmt = conn.prepareStatement(subcatSql.toString())) {
                if (selectedCategory != null && !selectedCategory.trim().isEmpty() && !selectedCategory.equalsIgnoreCase("All")) {
                    stmt.setString(1, selectedCategory.trim().toLowerCase());
                    stmt.setString(2, selectedCategory.trim().toLowerCase());
                }
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        options.getSubcategories().add(new ProductFilterOptions.SubcategoryOption(
                                rs.getLong("id"),
                                rs.getLong("category_id"),
                                rs.getString("category_name"),
                                rs.getString("name"),
                                rs.getInt("prod_count")
                        ));
                    }
                }
            }

            // 4. Brands with product counts (dynamically retrieved from MySQL)
            StringBuilder brandSql = new StringBuilder(
                    "SELECT b.id, b.name, COUNT(p.id) AS prod_count " +
                    "FROM brands b " +
                    "JOIN products p ON b.id = p.brand_id ");
            if (selectedCategory != null && !selectedCategory.trim().isEmpty() && !selectedCategory.equalsIgnoreCase("All")) {
                brandSql.append("JOIN categories c ON p.category_id = c.id WHERE LOWER(c.name) = ? OR LOWER(c.slug) = ? ");
            }
            brandSql.append("GROUP BY b.id, b.name ORDER BY b.name ASC");

            try (PreparedStatement stmt = conn.prepareStatement(brandSql.toString())) {
                if (selectedCategory != null && !selectedCategory.trim().isEmpty() && !selectedCategory.equalsIgnoreCase("All")) {
                    stmt.setString(1, selectedCategory.trim().toLowerCase());
                    stmt.setString(2, selectedCategory.trim().toLowerCase());
                }
                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        options.getBrands().add(new ProductFilterOptions.BrandOption(
                                rs.getLong("id"),
                                rs.getString("name"),
                                rs.getInt("prod_count")
                        ));
                    }
                }
            }

            // 5. Price Range (Min & Max from actual products)
            String priceSql = "SELECT MIN(price) AS min_price, MAX(price) AS max_price FROM products";
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery(priceSql)) {
                if (rs.next()) {
                    Map<String, Double> map = new HashMap<>();
                    map.put("min", rs.getDouble("min_price"));
                    map.put("max", rs.getDouble("max_price"));
                    options.setPriceRange(map);
                }
            }

            // 6. Ratings
            double[] thresholds = {5.0, 4.8, 4.5, 4.0, 3.0};
            String[] labels = {"5.0 Stars", "4.8 & above", "4.5 & above", "4.0 & above", "3.0 & above"};
            for (int i = 0; i < thresholds.length; i++) {
                String rSql = "SELECT COUNT(*) FROM products WHERE rating >= ?";
                try (PreparedStatement stmt = conn.prepareStatement(rSql)) {
                    stmt.setBigDecimal(1, BigDecimal.valueOf(thresholds[i]));
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) {
                            options.getRatings().add(new ProductFilterOptions.RatingOption(
                                    thresholds[i], labels[i], rs.getInt(1)));
                        }
                    }
                }
            }

            // 7. Discounts
            int[] discThresholds = {10, 20, 30, 40, 50};
            for (int d : discThresholds) {
                String dSql = "SELECT COUNT(*) FROM products WHERE discount >= ?";
                try (PreparedStatement stmt = conn.prepareStatement(dSql)) {
                    stmt.setInt(1, d);
                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) {
                            options.getDiscounts().add(new ProductFilterOptions.DiscountOption(
                                    d, d + "% or more", rs.getInt(1)));
                        }
                    }
                }
            }

            // 8. Availability
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT " +
                         "SUM(CASE WHEN stock_quantity > 0 THEN 1 ELSE 0 END) AS in_stock, " +
                         "SUM(CASE WHEN stock_quantity <= 0 THEN 1 ELSE 0 END) AS out_of_stock " +
                         "FROM products")) {
                if (rs.next()) {
                    options.getAvailability().add(new ProductFilterOptions.AvailabilityOption(
                            "inStock", "In Stock", rs.getInt("in_stock")));
                    options.getAvailability().add(new ProductFilterOptions.AvailabilityOption(
                            "outOfStock", "Out of Stock", rs.getInt("out_of_stock")));
                }
            }

            // 9. Offers
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT " +
                         "SUM(CASE WHEN discount > 0 THEN 1 ELSE 0 END) AS deals_count, " +
                         "SUM(CASE WHEN featured = 1 THEN 1 ELSE 0 END) AS featured_count, " +
                         "SUM(CASE WHEN best_seller = 1 THEN 1 ELSE 0 END) AS bestseller_count " +
                         "FROM products")) {
                if (rs.next()) {
                    options.getOffers().add(new ProductFilterOptions.OfferOption("deals", "Deals & Offers", rs.getInt("deals_count")));
                    options.getOffers().add(new ProductFilterOptions.OfferOption("featured", "Featured Items", rs.getInt("featured_count")));
                    options.getOffers().add(new ProductFilterOptions.OfferOption("bestSeller", "Best Sellers", rs.getInt("bestseller_count")));
                }
            }

        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error building filter options: " + e.getMessage(), e);
        }

        return options;
    }

    private Product mapProduct(ResultSet rs) throws SQLException {
        Product p = new Product();
        p.setId(rs.getLong("id"));
        p.setName(rs.getString("name"));
        p.setSlug(rs.getString("slug"));
        p.setDescription(rs.getString("description"));
        p.setPrice(rs.getBigDecimal("price"));
        p.setOriginalPrice(rs.getBigDecimal("original_price"));
        p.setDiscount(rs.getInt("discount"));
        p.setRating(rs.getBigDecimal("rating"));
        p.setReviewCount(rs.getInt("review_count"));
        p.setStockQuantity(rs.getInt("stock_quantity"));
        p.setSku(rs.getString("sku"));
        p.setFeatured(rs.getBoolean("featured"));
        p.setBestSeller(rs.getBoolean("best_seller"));
        p.setCreatedAt(rs.getTimestamp("created_at"));
        p.setCategory(rs.getString("category_name"));
        p.setCategorySlug(rs.getString("category_slug"));
        p.setSubcategory(rs.getString("subcategory_name"));
        p.setBrand(rs.getString("brand_name"));
        String img = rs.getString("main_image");
        if (img != null && !img.trim().isEmpty()) {
            p.setImage(img);
            p.setImageUrl(img);
        }
        return p;
    }

    private void populateProductImages(Connection conn, List<Product> products) {
        if (products.isEmpty()) return;
        String sql = "SELECT product_id, image_url FROM product_images WHERE product_id IN (";
        StringBuilder sb = new StringBuilder(sql);
        for (int i = 0; i < products.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("?");
        }
        sb.append(") ORDER BY sort_order ASC");

        try (PreparedStatement stmt = conn.prepareStatement(sb.toString())) {
            for (int i = 0; i < products.size(); i++) {
                stmt.setLong(i + 1, products.get(i).getId());
            }
            try (ResultSet rs = stmt.executeQuery()) {
                Map<Long, List<String>> map = new HashMap<>();
                while (rs.next()) {
                    long prodId = rs.getLong("product_id");
                    String url = rs.getString("image_url");
                    map.computeIfAbsent(prodId, k -> new ArrayList<>()).add(url);
                }
                for (Product p : products) {
                    List<String> imgs = map.get(p.getId());
                    if (imgs != null && !imgs.isEmpty()) {
                        p.setImages(imgs);
                        if (p.getImage() == null || p.getImage().isEmpty()) {
                            p.setImage(imgs.get(0));
                            p.setImageUrl(imgs.get(0));
                        }
                    }
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error populating product images: " + e.getMessage(), e);
        }
    }
}
