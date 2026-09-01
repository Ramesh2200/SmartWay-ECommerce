package com.ecommerce.config;

import java.math.BigDecimal;
import java.sql.*;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Master Database Seeder — Initializes relational schema and seeds 101+ master products.
 */
public class DatabaseSeeder {

    private static final Logger LOGGER = Logger.getLogger(DatabaseSeeder.class.getName());

    public static void seedDatabase() {
        try (Connection conn = DatabaseConnection.getConnection()) {
            LOGGER.info("Starting Master Database Schema & Product Seed...");

            // 1. Create Tables
            createTables(conn);

            // 2. Check if products exist; if count < 100, seed the master catalog
            if (getProductCount(conn) < 100) {
                LOGGER.info("Seeding 101 Master Products into MySQL...");
                seedCatalogData(conn);
                LOGGER.info("Database seeding complete! Total products in MySQL: " + getProductCount(conn));
            } else {
                LOGGER.info("Database already contains " + getProductCount(conn) + " products.");
            }

        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Database seeding error: " + e.getMessage(), e);
        }
    }

    private static void createTables(Connection conn) throws SQLException {
        try (Statement stmt = conn.createStatement()) {
            stmt.execute("SET FOREIGN_KEY_CHECKS = 0");
            stmt.execute("DROP TABLE IF EXISTS order_items");
            stmt.execute("DROP TABLE IF EXISTS orders");
            stmt.execute("SET FOREIGN_KEY_CHECKS = 1");

            stmt.execute("CREATE TABLE IF NOT EXISTS users (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "full_name VARCHAR(100) NOT NULL, " +
                    "email VARCHAR(100) NOT NULL UNIQUE, " +
                    "password_hash VARCHAR(255) NOT NULL, " +
                    "email_verified BOOLEAN DEFAULT FALSE, " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            stmt.execute("CREATE TABLE IF NOT EXISTS categories (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "name VARCHAR(100) NOT NULL UNIQUE, " +
                    "slug VARCHAR(100) NOT NULL UNIQUE, " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            stmt.execute("CREATE TABLE IF NOT EXISTS subcategories (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "category_id BIGINT NOT NULL, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE, " +
                    "UNIQUE KEY uk_cat_subcat (category_id, name)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            stmt.execute("CREATE TABLE IF NOT EXISTS brands (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "name VARCHAR(100) NOT NULL UNIQUE, " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            stmt.execute("CREATE TABLE IF NOT EXISTS products (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "category_id BIGINT NOT NULL, " +
                    "subcategory_id BIGINT DEFAULT NULL, " +
                    "brand_id BIGINT DEFAULT NULL, " +
                    "name VARCHAR(255) NOT NULL, " +
                    "slug VARCHAR(255) DEFAULT NULL, " +
                    "description TEXT, " +
                    "price DECIMAL(12,2) NOT NULL, " +
                    "original_price DECIMAL(12,2) DEFAULT NULL, " +
                    "discount INT DEFAULT 0, " +
                    "rating DECIMAL(3,2) DEFAULT 4.50, " +
                    "review_count INT DEFAULT 0, " +
                    "stock_quantity INT DEFAULT 50, " +
                    "sku VARCHAR(100) DEFAULT NULL, " +
                    "featured BOOLEAN DEFAULT FALSE, " +
                    "best_seller BOOLEAN DEFAULT FALSE, " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE, " +
                    "FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL, " +
                    "FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            stmt.execute("CREATE TABLE IF NOT EXISTS product_images (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "product_id BIGINT NOT NULL, " +
                    "image_url VARCHAR(1000) NOT NULL, " +
                    "sort_order INT DEFAULT 0, " +
                    "FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            stmt.execute("CREATE TABLE IF NOT EXISTS orders (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "order_number VARCHAR(100) NOT NULL UNIQUE, " +
                    "user_id BIGINT NOT NULL, " +
                    "status VARCHAR(50) DEFAULT 'CONFIRMED', " +
                    "subtotal DECIMAL(12,2) NOT NULL, " +
                    "discount DECIMAL(12,2) DEFAULT 0.00, " +
                    "shipping_fee DECIMAL(12,2) DEFAULT 0.00, " +
                    "total_amount DECIMAL(12,2) NOT NULL, " +
                    "payment_status VARCHAR(50) DEFAULT 'PENDING', " +
                    "payment_method VARCHAR(50) DEFAULT 'COD', " +
                    "payment_id VARCHAR(100) DEFAULT NULL, " +
                    "shipping_address TEXT NOT NULL, " +
                    "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                    "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
                    "INDEX idx_orders_user (user_id), " +
                    "INDEX idx_orders_created (created_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

            stmt.execute("CREATE TABLE IF NOT EXISTS order_items (" +
                    "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                    "order_id BIGINT NOT NULL, " +
                    "product_id BIGINT NOT NULL, " +
                    "product_name VARCHAR(255) NOT NULL, " +
                    "product_image VARCHAR(1000) DEFAULT NULL, " +
                    "quantity INT NOT NULL, " +
                    "unit_price DECIMAL(12,2) NOT NULL, " +
                    "discount INT DEFAULT 0, " +
                    "subtotal DECIMAL(12,2) NOT NULL, " +
                    "FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE, " +
                    "INDEX idx_oi_order (order_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        }
    }

    private static int getProductCount(Connection conn) {
        String sql = "SELECT COUNT(*) FROM products";
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) {
                return rs.getInt(1);
            }
        } catch (SQLException ignored) {}
        return 0;
    }

    private static long getOrCreateCategory(Connection conn, String name, String slug) throws SQLException {
        String query = "SELECT id FROM categories WHERE name = ?";
        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, name);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) return rs.getLong("id");
            }
        }
        String insert = "INSERT INTO categories (name, slug) VALUES (?, ?)";
        try (PreparedStatement stmt = conn.prepareStatement(insert, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, name);
            stmt.setString(2, slug);
            stmt.executeUpdate();
            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) return rs.getLong(1);
            }
        }
        return 1L;
    }

    private static long getOrCreateSubcategory(Connection conn, long categoryId, String name) throws SQLException {
        String query = "SELECT id FROM subcategories WHERE category_id = ? AND name = ?";
        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setLong(1, categoryId);
            stmt.setString(2, name);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) return rs.getLong("id");
            }
        }
        String insert = "INSERT INTO subcategories (category_id, name) VALUES (?, ?)";
        try (PreparedStatement stmt = conn.prepareStatement(insert, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setLong(1, categoryId);
            stmt.setString(2, name);
            stmt.executeUpdate();
            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) return rs.getLong(1);
            }
        }
        return 1L;
    }

    private static long getOrCreateBrand(Connection conn, String name) throws SQLException {
        String query = "SELECT id FROM brands WHERE name = ?";
        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, name);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) return rs.getLong("id");
            }
        }
        String insert = "INSERT INTO brands (name) VALUES (?)";
        try (PreparedStatement stmt = conn.prepareStatement(insert, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, name);
            stmt.executeUpdate();
            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) return rs.getLong(1);
            }
        }
        return 1L;
    }

    private static void seedCatalogData(Connection conn) throws SQLException {
        // Clear existing product tables to ensure fresh full 101 seed
        try (Statement stmt = conn.createStatement()) {
            stmt.execute("SET FOREIGN_KEY_CHECKS = 0");
            stmt.execute("TRUNCATE TABLE product_images");
            stmt.execute("TRUNCATE TABLE products");
            stmt.execute("TRUNCATE TABLE subcategories");
            stmt.execute("TRUNCATE TABLE categories");
            stmt.execute("TRUNCATE TABLE brands");
            stmt.execute("SET FOREIGN_KEY_CHECKS = 1");
        }

        // Insert Master Products Data
        insertSeedProduct(conn, 1L, "Electronics", "electronics", "Smartphones", "Apple", "Apple iPhone 15 Pro Max", "apple-iphone-15-pro-max",
                "Forged in aerospace-grade titanium and featuring the groundbreaking A17 Pro chip, customizable Action button, and 5x Telephoto optical zoom.",
                159900, 179900, 11, 4.9, 320, 45, "EL-IPH-15PM-256", true, true,
                "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=700&auto=format&fit=crop&q=85", "https://images.unsplash.com/photo-1695048133021-39e24687d903?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 2L, "Electronics", "electronics", "Smartphones", "Samsung", "Samsung Galaxy S24 Ultra", "samsung-galaxy-s24-ultra",
                "Meet Galaxy S24 Ultra with a new titanium exterior, 6.8-inch flat display, integrated S Pen, and Galaxy AI live translations.",
                129999, 144999, 10, 4.8, 285, 38, "EL-SAM-S24U-256", true, true,
                "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=700&auto=format&fit=crop&q=85", "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 3L, "Electronics", "electronics", "Laptops", "Apple", "Apple MacBook Pro 16-inch M3 Max", "apple-macbook-pro-16-m3-max",
                "The most advanced Mac laptop ever built for extreme workflows. Up to 22 hours of battery life with Liquid Retina XDR display.",
                249900, 289900, 14, 4.9, 140, 20, "EL-MBP-16M3-512", true, false,
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=700&auto=format&fit=crop&q=85", "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 4L, "Electronics", "electronics", "Laptops", "Dell", "Dell XPS 15 OLED Touch Laptop", "dell-xps-15-oled",
                "Precision-crafted with CNC aluminum and carbon fiber, featuring an immersive 3.5K OLED InfinityEdge touch display.",
                184990, 210000, 12, 4.7, 98, 25, "EL-DEL-XPS15-1TB", false, false,
                "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=700&auto=format&fit=crop&q=85", "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 5L, "Electronics", "electronics", "Headphones", "Sony", "Sony WH-1000XM5 Noise-Canceling Headphones", "sony-wh-1000xm5",
                "Industry-leading noise cancellation with 8 microphones, Auto NC Optimizer, and ultra-comfortable lightweight design.",
                26990, 34990, 23, 4.8, 512, 60, "EL-SNY-WH1000XM5", true, true,
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&auto=format&fit=crop&q=85", "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 6L, "Electronics", "electronics", "Earbuds", "Apple", "Apple AirPods Pro (2nd Generation USB-C)", "apple-airpods-pro-2nd-gen",
                "Up to 2x more Active Noise Cancellation, Adaptive Audio, Transparency mode, and Personalized Spatial Audio with dynamic head tracking.",
                20990, 24900, 16, 4.8, 670, 80, "EL-APP-APP2-USBC", false, true,
                "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=700&auto=format&fit=crop&q=85", "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 7L, "Electronics", "electronics", "Smart Watches", "Apple", "Apple Watch Ultra 2 Titanium 49mm", "apple-watch-ultra-2",
                "The most rugged and capable Apple Watch designed for endurance athletes, outdoor adventurers, and water sports enthusiasts.",
                89900, 89900, 0, 4.9, 180, 30, "EL-APP-AWU2-49", true, false,
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 8L, "Electronics", "electronics", "Speakers", "Bose", "Bose SoundLink Revolve+ II 360° Speaker", "bose-soundlink-revolve-plus-ii",
                "Engineered to deliver true 360° sound for consistent, uniform coverage with flexible fabric handle for portability.",
                24500, 29900, 18, 4.7, 210, 42, "EL-BSE-SLR2-BLK", false, false,
                "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1545454675-3531b543be5d?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 9L, "Electronics", "electronics", "Cameras", "Sony", "Sony Alpha A7 IV Full-Frame Mirrorless Camera", "sony-alpha-a7-iv",
                "An all-arounder that pushes beyond basic with outstanding 33MP still image quality and 4K 60p video recording.",
                214990, 242990, 12, 4.9, 88, 15, "EL-SNY-A7M4-BODY", true, false,
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 10L, "Electronics", "electronics", "Monitors", "LG", "LG UltraGear 34-inch Curved OLED Gaming Monitor", "lg-ultragear-34-curved-oled",
                "34-inch WQHD 800R curved OLED display with 240Hz refresh rate and 0.03ms response time for supreme gaming visuals.",
                98900, 125000, 21, 4.8, 76, 18, "EL-LG-UG34-OLED", false, false,
                "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 11L, "Electronics", "electronics", "Mice", "Logitech", "Logitech MX Master 3S Wireless Mouse", "logitech-mx-master-3s",
                "An iconic mouse remastered with Quiet Clicks and 8,000 DPI track-on-glass sensor for ultimate speed and precision.",
                8995, 10995, 18, 4.9, 430, 95, "EL-LOG-MXM3S-GRY", false, true,
                "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 12L, "Electronics", "electronics", "Keyboards", "Keychron", "Keychron Q1 Pro Custom Mechanical Keyboard", "keychron-q1-pro-mechanical",
                "Full aluminum CNC 75% layout custom wireless mechanical keyboard with double-gasket design and QMK/VIA support.",
                17499, 19999, 12, 4.8, 115, 35, "EL-KEY-Q1PRO-RGB", false, false,
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 13L, "Electronics", "electronics", "Power banks", "Anker", "Anker 737 Power Bank (PowerCore 24K 140W)", "anker-737-power-bank-140w",
                "Ultra-powerful two-way fast charging portable battery with smart digital display and 24,000mAh capacity.",
                11999, 14999, 20, 4.8, 240, 50, "EL-ANK-737-24K", false, true,
                "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 14L, "Electronics", "electronics", "Tablets", "Apple", "Apple iPad Pro 12.9-inch M2 Liquid Retina", "apple-ipad-pro-12-9-m2",
                "Astonishing performance with M2 chip, next-generation Apple Pencil hover, and Liquid Retina XDR mini-LED display.",
                112900, 122900, 8, 4.9, 195, 28, "EL-APP-IPAD129-M2", false, false,
                "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 15L, "Electronics", "electronics", "Networking devices", "TP-Link", "TP-Link Deco XE75 Pro Tri-Band WiFi 6E Router", "tp-link-deco-xe75-pro",
                "Whole-home tri-band mesh Wi-Fi 6E system delivering up to 5400 Mbps speeds and 2.5 Gbps multi-gig port.",
                24999, 29999, 17, 4.7, 65, 32, "EL-TPL-XE75-2PK", false, false,
                "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=700&auto=format&fit=crop&q=85"});

        // 2. FASHION (15 Products)
        insertSeedProduct(conn, 16L, "Fashion", "fashion", "Jackets", "Milano Luxe", "Men Premium Italian Leather Biker Jacket", "men-italian-leather-biker-jacket",
                "Handcrafted from 100% full-grain Italian lambskin leather with heavy-duty YKK metal zippers and quilted satin interior lining.",
                14999, 24999, 40, 4.8, 85, 25, "FA-ML-JKT-BLK-L", true, false,
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 17L, "Fashion", "fashion", "Sneakers", "Nike", "Nike Air Jordan 1 Retro High OG Sneakers", "nike-air-jordan-1-retro-high",
                "The iconic silhouette that changed sneaker history forever. Premium leather upper with encapsulated Nike Air cushioning.",
                16995, 18995, 11, 4.9, 420, 40, "FA-NK-AJ1-RED-9", true, true,
                "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 18L, "Fashion", "fashion", "Dresses", "Silk & Co", "Women Pure Mulberry Silk Evening Slip Dress", "women-pure-silk-evening-dress",
                "Exquisite 22-momme Grade 6A mulberry silk slip dress with cowl neckline and elegant side-slit drape.",
                8499, 12999, 35, 4.7, 110, 30, "FA-SC-SLK-EMR-M", false, false,
                "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 19L, "Fashion", "fashion", "Shirts", "Oxford Club", "Men Slim-Fit Oxford Cotton Formal Shirt", "men-slim-fit-oxford-shirt",
                "Crafted from 100% combed long-staple cotton with a classic button-down collar and wrinkle-resistant weave.",
                2299, 3499, 34, 4.6, 210, 75, "FA-OC-OXF-WHT-40", false, true,
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 20L, "Fashion", "fashion", "Jackets", "London Heritage", "Women Classic Double-Breasted Trench Coat", "women-classic-trench-coat",
                "Timeless weather-resistant cotton gabardine trench coat featuring storm flaps, belted waist, and horn buttons.",
                11999, 18500, 35, 4.8, 94, 22, "FA-LH-TRN-BGE-S", false, false,
                "https://images.unsplash.com/photo-1544441893-675973e31985?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1544441893-675973e31985?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 21L, "Fashion", "fashion", "Jeans", "Levi's", "Levi's 501 Original Fit Raw Selvedge Jeans", "levis-501-original-fit-jeans",
                "The blueprint for every pair of jeans in existence since 1873. Premium 14oz raw selvedge denim with iconic straight leg.",
                4999, 6999, 29, 4.7, 380, 65, "FA-LEV-501-RAW-32", false, true,
                "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 22L, "Fashion", "fashion", "Bags", "Aura Leather", "Women Genuine Pebbled Leather Tote Handbag", "women-leather-tote-handbag",
                "Spacious everyday luxury tote crafted from buttery soft pebbled cowhide leather with gold-tone hardware and laptop divider.",
                6999, 11999, 42, 4.8, 175, 40, "FA-AL-TOT-TAN-OS", false, false,
                "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 23L, "Fashion", "fashion", "Shoes", "Adidas", "Adidas Ultraboost Light Running Shoes", "adidas-ultraboost-light",
                "Experience epic energy return with Light BOOST cushioning, 30% lighter than previous generations, and Primeknit+ upper.",
                14999, 18999, 21, 4.8, 290, 55, "FA-AD-UBL-BLK-8", true, true,
                "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 24L, "Fashion", "fashion", "T-shirts", "Essential Basics", "Men Organic Pima Cotton Crew T-Shirt (Pack of 3)", "men-organic-pima-tshirt-pack",
                "Ultra-soft Peruvian Pima cotton classic crew neck tees with pre-shrunk wash and durable double-needle stitching.",
                2499, 3999, 38, 4.7, 185, 90, "FA-EB-TSH-3PK-M", false, false,
                "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 25L, "Fashion", "fashion", "Kids clothing", "TinyTrend", "Kids Organic Cotton Fleece Hoodie & Jogger Set", "kids-cotton-hoodie-jogger-set",
                "Cozy brushed fleece tracksuit set for kids featuring playful graphics, elastic waistband, and ribbed cuffs.",
                1899, 2899, 34, 4.6, 65, 45, "FA-TT-KID-SET-6Y", false, false,
                "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 26L, "Fashion", "fashion", "Sunglasses", "Ray-Ban", "Ray-Ban Classic Gold Aviator Polarized Sunglasses", "ray-ban-classic-aviator",
                "Originally designed for US aviators in 1937, featuring gold metal frames and polarized green classic G-15 crystal lenses.",
                10490, 12990, 19, 4.8, 310, 50, "FA-RB-AVI-GLD-58", false, true,
                "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 27L, "Fashion", "fashion", "Women's clothing", "Nordic Luxe", "Women Pure Cashmere Knit Turtleneck Sweater", "women-pure-cashmere-turtleneck",
                "Spun from 100% Grade-A Mongolian cashmere with ribbed trims and relaxed silhouette for cloud-like softness.",
                9999, 15999, 38, 4.9, 82, 20, "FA-NL-CSH-CRM-M", false, false,
                "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 28L, "Fashion", "fashion", "Shoes", "Cobbler & Co", "Men Handcrafted Suede Chelsea Boots", "men-suede-chelsea-boots",
                "Classic British silhouette crafted from water-resistant calfskin suede with flexible elastic side gores and Goodyear welted sole.",
                7999, 12499, 36, 4.7, 145, 35, "FA-CC-CHL-BRN-42", false, false,
                "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 29L, "Fashion", "fashion", "Bags", "Samsonite", "Samsonite Proxis Hardside Spinner Suitcase 75cm", "samsonite-proxis-spinner-luggage",
                "Remarkably resilient and lightweight suitcase made from multi-layered Roxkin material with 4 dual-suspension spinner wheels.",
                28990, 36000, 19, 4.9, 70, 15, "FA-SAM-PRX-SLV-75", false, false,
                "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 30L, "Fashion", "fashion", "Watches", "Fossil", "Fossil Minimalist Chronograph Amber Leather Watch", "fossil-minimalist-chronograph-watch",
                "Sophisticated 42mm timepiece with satin sunray dial, chronograph sub-dials, and interchangeable genuine amber leather strap.",
                9495, 13995, 32, 4.7, 190, 48, "FA-FOS-MIN-BLU-42", false, false,
                "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=700&auto=format&fit=crop&q=85"});

        // 3. HOME & LIVING (15 Products)
        insertSeedProduct(conn, 31L, "Home & Living", "home-living", "Chairs", "Nordic Habitat", "Nordic Emerald Velvet Ergonomic Armchair", "modern-nordic-velvet-armchair",
                "Mid-century accent lounge chair upholstered in stain-resistant velvet fabric with gold-plated stainless steel legs.",
                18999, 28999, 34, 4.8, 65, 20, "HL-NH-CHR-EMR", true, false,
                "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 32L, "Home & Living", "home-living", "Tables", "WoodCrafters", "Solid Sheesham Wood 6-Seater Dining Table", "solid-sheesham-dining-table",
                "Crafted from 100% natural seasoned Indian Rosewood with rich walnut finish and clean geometric lines.",
                29999, 45000, 33, 4.8, 50, 12, "HL-WC-TAB-SHE-6S", false, false,
                "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 33L, "Home & Living", "home-living", "Kitchen products", "Dyson", "Dyson V12 Detect Slim Absolute Cordless Vacuum", "dyson-v12-detect-slim-vacuum",
                "Dyson’s lightest intelligent cordless vacuum with laser illumination that reveals microscopic dust on hard floors.",
                49900, 55900, 11, 4.9, 180, 25, "HL-DYS-V12-SLM", true, true,
                "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1558317374-067fb5f30001?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 34L, "Home & Living", "home-living", "Lamps", "Philips", "Philips Hue Smart Gradient Floor Lamp", "philips-hue-smart-gradient-lamp",
                "Blend multiple colors of light simultaneously with smart app control and dynamic lighting effects.",
                19999, 24999, 20, 4.7, 72, 30, "HL-PH-HUE-GRD-BLK", false, false,
                "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 35L, "Home & Living", "home-living", "Kitchen products", "De'Longhi", "DeLonghi Dedica Deluxe Espresso Machine", "delonghi-dedica-deluxe-espresso",
                "Slim 15-bar pump espresso maker with manual milk frother for rich barista-quality lattes and cappuccinos.",
                21990, 28990, 24, 4.8, 140, 35, "HL-DLG-DED-SS", false, true,
                "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 36L, "Home & Living", "home-living", "Bedding", "CozyLoom", "Organic Bamboo 400TC Queen Bedding Sheet Set", "organic-bamboo-bedding-set-queen",
                "Silky smooth thermo-regulating 400 thread count bamboo viscose sheet set with deep pocket fitted sheet.",
                4499, 7999, 44, 4.9, 230, 60, "HL-CL-BAM-QN-SGE", false, true,
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 37L, "Home & Living", "home-living", "Kitchen products", "Le Creuset", "Le Creuset Enameled Cast Iron Round Dutch Oven 5.5 Qt", "le-creuset-cast-iron-dutch-oven",
                "The culinary classic crafted in France with superior heat retention and colorful chip-resistant porcelain enamel.",
                34500, 39900, 14, 4.9, 160, 18, "HL-LC-DCH-CER-55", false, false,
                "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 38L, "Home & Living", "home-living", "Decor", "Artisan Loom", "Bohemian Hand-Woven Jute & Wool Area Rug (5x8 ft)", "hand-woven-jute-wool-rug",
                "Artisan-crafted natural fiber floor rug with geometric diamond pattern for living rooms and bedrooms.",
                6999, 11999, 42, 4.7, 88, 28, "HL-AL-RUG-JUT-58", false, false,
                "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 39L, "Home & Living", "home-living", "Decor", "Nordic Studio", "Minimalist Matte Ceramic Donut Vase Set (3 Pieces)", "matte-ceramic-vase-set",
                "Modern Scandinavian donut-style and ribbed ceramic tabletop vase set with textured matte beige glaze.",
                1799, 2999, 40, 4.8, 140, 80, "HL-NS-VAS-3PK-MAT", false, false,
                "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 40L, "Home & Living", "home-living", "Decor", "Marshall", "Marshall Stanmore III Vintage Bluetooth Speaker", "marshall-stanmore-iii-speaker",
                "Legendary room-filling sound with vintage vinyl and brass accents, re-engineered with wider stereo soundstage.",
                34999, 39999, 13, 4.9, 110, 22, "HL-MSH-STN3-BRN", true, false,
                "https://images.unsplash.com/photo-1543512214-318c7553f230?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1543512214-318c7553f230?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 41L, "Home & Living", "home-living", "Decor", "LuxeDrape", "Luxury Navy Velvet 99% Blackout Curtains (2 Panels)", "luxury-velvet-blackout-curtains",
                "Heavyweight thermal insulated luxury velvet curtains that block 99% of sunlight and reduce ambient outside noise.",
                2999, 4999, 40, 4.7, 175, 55, "HL-LD-CRT-NVY-84", false, false,
                "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1513694203232-719a280e022f?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 42L, "Home & Living", "home-living", "Kitchen products", "Staub", "Staub Cast Iron 12-inch Enameled Grill Pan", "staub-enameled-grill-pan-12",
                "Made in France with deep ridges for authentic BBQ grill marks while excess fat drains away from meats and veggies.",
                18500, 23900, 23, 4.8, 75, 20, "HL-STB-GRL-BLK-12", false, false,
                "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 43L, "Home & Living", "home-living", "Storage", "ClarityHome", "Stackable Acrylic Clear Storage Organizer Drawers", "acrylic-storage-organizer-drawers",
                "Set of 4 shatter-resistant crystal-clear storage drawers with smooth slide-out rails for pantry, cosmetics, and wardrobe.",
                2499, 3999, 38, 4.6, 190, 85, "HL-CH-DRW-4PK-CLR", false, false,
                "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 44L, "Home & Living", "home-living", "Home accessories", "Aegean Soft", "Organic Cotton Turkish Waffle Bath Towel Set (6-Piece)", "organic-cotton-waffle-bath-towel-set",
                "Ultra-absorbent, fast-drying 100% Turkish organic cotton towels featuring a honeycomb waffle weave texture.",
                3299, 5499, 40, 4.8, 135, 50, "HL-AS-TWL-6PK-GRY", false, false,
                "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 45L, "Home & Living", "home-living", "Home accessories", "AromaZen", "Smart Essential Oil Ultrasonic Aroma Diffuser 500ml", "smart-aroma-essential-oil-diffuser",
                "500ml wood grain ultrasonic cool mist humidifier with ambient LED mood light and automatic shut-off timer.",
                1899, 2999, 37, 4.7, 220, 90, "HL-AZ-DIF-500-WOD", false, true,
                "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=700&auto=format&fit=crop&q=85"});

        // 4. BEAUTY & CARE (15 Products)
        insertSeedProduct(conn, 46L, "Beauty & Care", "beauty-care", "Haircare", "Dyson", "Dyson Airwrap Multi-Styler Complete Long", "dyson-airwrap-multi-styler-complete",
                "Dry, curl, shape and hide flyaways using the Coanda effect without extreme heat for salon-grade hairstyles.",
                49900, 52900, 6, 4.9, 310, 24, "BT-DYS-AWP-LNG-NKL", true, true,
                "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 47L, "Beauty & Care", "beauty-care", "Skincare", "Estée Lauder", "Estée Lauder Advanced Night Repair Serum 50ml", "estee-lauder-advanced-night-repair-50ml",
                "The #1 repair serum that reduces the look of multiple signs of aging caused by environmental assaults of modern life.",
                8900, 10500, 15, 4.9, 450, 60, "BT-EL-ANR-50ML", true, true,
                "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 48L, "Beauty & Care", "beauty-care", "Perfume", "Chanel", "Chanel Coco Mademoiselle Eau De Parfum 100ml", "chanel-coco-mademoiselle-edp-100ml",
                "An oriental fragrance with a strong personality, yet surprisingly fresh. Vibrant orange sparks followed by clear jasmine and May rose.",
                14500, 16500, 12, 5.0, 520, 35, "BT-CHN-MAD-100ML", true, true,
                "https://images.unsplash.com/photo-1541643600914-78b084683601?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1541643600914-78b084683601?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 49L, "Beauty & Care", "beauty-care", "Skincare", "La Mer", "La Mer Crème de la Mer Moisturizing Cream 60ml", "la-mer-creme-de-la-mer-60ml",
                "The legendary moisturizing cream that heals dryness and immerses skin in deep, soothing moisture powered by cell-renewing Miracle Broth.",
                29500, 33000, 11, 4.8, 140, 15, "BT-LM-CRM-60ML", false, false,
                "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 50L, "Beauty & Care", "beauty-care", "Grooming", "Braun", "Braun Series 9 Pro Wet & Dry Electric Shaver", "braun-series-9-pro-shaver",
                "World's most efficient electric razor with innovative ProHead trimmer that captures 1-, 3- or 7-day beards gently.",
                24999, 32999, 24, 4.8, 195, 30, "BT-BRN-S9P-9477CC", false, false,
                "https://images.unsplash.com/photo-1621607512214-68297480165e?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1621607512214-68297480165e?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 51L, "Beauty & Care", "beauty-care", "Makeup", "Charlotte Tilbury", "Charlotte Tilbury Pillow Talk Luxury Eyeshadow Palette", "charlotte-tilbury-pillow-talk-palette",
                "Four universally flattering nude-pink eyeshadow shades with soft-focus matte and metallic shimmer finishes.",
                4900, 5500, 11, 4.8, 280, 45, "BT-CT-PLW-EYE-OS", false, false,
                "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 52L, "Beauty & Care", "beauty-care", "Haircare", "Olaplex", "Olaplex No. 3 Hair Perfector Repair Treatment 100ml", "olaplex-no-3-hair-perfector-100ml",
                "At-home bond building hair treatment that reduces breakage and visibly strengthens hair, improving its look and feel.",
                2950, 3400, 13, 4.8, 610, 90, "BT-OLP-NO3-100ML", false, true,
                "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 53L, "Beauty & Care", "beauty-care", "Perfume", "Tom Ford", "Tom Ford Oud Wood Private Blend Eau De Parfum 50ml", "tom-ford-oud-wood-edp-50ml",
                "A masterpiece of rare oud wood, rosewood, cardamom, and sensual amber that creates an unforgettable smoky aura.",
                21500, 24500, 12, 4.9, 190, 20, "BT-TF-OUD-50ML", false, false,
                "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 54L, "Beauty & Care", "beauty-care", "Skincare", "FOREO", "FOREO LUNA 4 Sonic Facial Cleansing & Firming Device", "foreo-luna-4-cleansing-device",
                "Ultra-hygienic silicone facial brush with T-Sonic pulsations that removes 99% of dirt, oil, and makeup residue in 1 minute.",
                18900, 22900, 17, 4.7, 85, 30, "BT-FOR-LUN4-PNK", false, false,
                "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 55L, "Beauty & Care", "beauty-care", "Makeup", "MAC", "MAC Studio Fix Fluid Foundation SPF 15 30ml", "mac-studio-fix-fluid-foundation",
                "Modern matte liquid foundation with medium-to-full buildable coverage and 24-hour shine control wear.",
                3600, 3900, 8, 4.8, 480, 75, "BT-MAC-SFF-NC30", false, true,
                "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 56L, "Beauty & Care", "beauty-care", "Haircare", "Kérastase", "Kérastase Elixir Ultime L’Huile Original Hair Oil 100ml", "kerastase-elixir-ultime-hair-oil",
                "Iconic beautifying hair oil infused with precious wild camellia extract that delivers intense shine and anti-frizz control.",
                3950, 4500, 12, 4.9, 240, 65, "BT-KER-ELX-100ML", false, false,
                "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 57L, "Beauty & Care", "beauty-care", "Personal care", "Philips", "Philips Sonicare DiamondClean 9000 Electric Toothbrush", "philips-sonicare-diamondclean-9000",
                "Removes up to 10x more plaque with 62,000 sonic vibrations per minute and smart pressure sensor.",
                16995, 21995, 23, 4.8, 155, 40, "BT-PH-DC9000-BLK", false, false,
                "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1559599101-f09722fb4948?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 58L, "Beauty & Care", "beauty-care", "Skincare", "Kiehl's", "Kiehl’s Ultra Facial Cream with Squalane 50ml", "kiehls-ultra-facial-cream-50ml",
                "#1 bestselling ultra-lightweight 24-hour daily face moisturizer with olive-derived squalane and glacial glycoprotein.",
                3200, 3600, 11, 4.8, 380, 85, "BT-KHL-UFC-50ML", false, false,
                "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 59L, "Beauty & Care", "beauty-care", "Perfume", "Jo Malone", "Jo Malone London English Pear & Freesia Cologne 100ml", "jo-malone-english-pear-freesia-100ml",
                "The essence of autumn. The sensuous freshness of just-ripe pears wrapped in a bouquet of white freesias and mellowed by amber and patchouli.",
                12800, 14500, 12, 4.9, 210, 30, "BT-JM-EPF-100ML", false, false,
                "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 60L, "Beauty & Care", "beauty-care", "Makeup", "NARS", "NARS Radiant Creamy Concealer 6ml", "nars-radiant-creamy-concealer",
                "The award-winning multi-action concealer that contours, highlights, corrects, and perfects with 16-hour hydration.",
                3000, 3400, 12, 4.8, 520, 90, "BT-NRS-RCC-CUS", false, true,
                "https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=700&auto=format&fit=crop&q=85"});

        // 5. SPORTS & FITNESS (10 Products)
        insertSeedProduct(conn, 61L, "Sports & Fitness", "sports-fitness", "Running shoes", "Nike", "Nike ZoomX Vaporfly Next% 3 Marathon Shoes", "nike-zoomx-vaporfly-next-3",
                "The pinnacle of road racing footwear, engineered with ZoomX responsive foam and full-length carbon fiber Flyplate.",
                20695, 22995, 10, 4.9, 140, 25, "SP-NK-VPF3-WHT-9", true, false,
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 62L, "Sports & Fitness", "sports-fitness", "Fitness equipment", "Bowflex", "Bowflex SelectTech 552 Adjustable Dumbbells Pair", "bowflex-selecttech-552-dumbbells",
                "Combines 15 sets of weights into one compact system with an easy-turn dial that adjusts from 5 to 52.5 lbs (2.3 to 24 kg).",
                34999, 42999, 19, 4.8, 260, 20, "SP-BWF-ST552-PAIR", true, true,
                "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 63L, "Sports & Fitness", "sports-fitness", "Yoga products", "Manduka", "Manduka PRO Yoga Mat 6mm Non-Slip High Density", "manduka-pro-yoga-mat-6mm",
                "The legendary #1 yoga mat recommended by teachers worldwide, engineered with high-density cushion and closed-cell hygienic surface.",
                9999, 12500, 20, 4.9, 310, 45, "SP-MAN-PRO-BLK-71", false, false,
                "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 64L, "Sports & Fitness", "sports-fitness", "Outdoor accessories", "Garmin", "Garmin Forerunner 965 GPS AMOLED Running Watch", "garmin-forerunner-965-smartwatch",
                "Premium GPS running smartwatch with brilliant 1.4-inch AMOLED touchscreen, titanium bezel, and built-in full-color mapping.",
                67490, 74990, 10, 4.9, 95, 18, "SP-GAR-FR965-BLK", false, false,
                "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 65L, "Sports & Fitness", "sports-fitness", "Football", "Adidas", "Adidas FIFA World Cup Pro Match Football Size 5", "adidas-fifa-world-cup-pro-football",
                "Official match ball engineered with thermally bonded seamless surface for more predictable trajectory and lower water uptake.",
                8999, 11999, 25, 4.8, 180, 50, "SP-AD-FWC-PRO-S5", false, true,
                "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 66L, "Sports & Fitness", "sports-fitness", "Cricket", "SS Sunridges", "SS Ton Reserve Grade 1 English Willow Cricket Bat", "ss-ton-reserve-edition-cricket-bat",
                "Masterfully hand-crafted from selected Grade 1 English Willow with massive contoured edges and feather-light pickup.",
                26999, 34999, 23, 4.8, 75, 15, "SP-SS-TON-RES-SH", false, false,
                "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 67L, "Sports & Fitness", "sports-fitness", "Basketball", "Wilson", "Wilson NBA Official Game Leather Basketball (Size 7)", "wilson-nba-official-game-basketball",
                "The genuine leather official game ball of the NBA constructed with 100% genuine Horween leather that breaks in over time.",
                13999, 16999, 18, 4.9, 120, 25, "SP-WIL-NBA-OFF-S7", false, false,
                "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1519861531473-9200262188bf?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 68L, "Sports & Fitness", "sports-fitness", "Cycling", "Trek", "Trek Marlin 7 Gen 3 Hardtail Mountain Trail Bike", "trek-marlin-7-gen-3-mountain-bike",
                "Trail-ready hardtail mountain bike with RockShox suspension fork, 1x10 Shimano Deore drivetrain, and hydraulic disc brakes.",
                64990, 72990, 11, 4.9, 45, 10, "SP-TRK-M7G3-BLU-M", true, false,
                "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 69L, "Sports & Fitness", "sports-fitness", "Outdoor accessories", "Hydro Flask", "Hydro Flask 32 oz Wide Mouth Vacuum Insulated Bottle", "hydro-flask-32oz-wide-mouth",
                "Keeps beverages cold for up to 24 hours and hot for 12 hours with TempShield double-wall vacuum insulation.",
                3499, 4499, 22, 4.8, 350, 80, "SP-HF-32WM-PAC-OS", false, true,
                "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 70L, "Sports & Fitness", "sports-fitness", "Outdoor accessories", "Osprey", "Osprey Atmos AG 65 Anti-Gravity Backpacking Pack", "osprey-atmos-ag-65-backpack",
                "Groundbreaking AntiGravity 3D suspended mesh backsystem that seamlessly contours to your body for multi-day expeditions.",
                24990, 29990, 17, 4.9, 95, 18, "SP-OSP-ATM65-GRN-L", false, false,
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&auto=format&fit=crop&q=85"});

        // 6. AUTOMOTIVE (8 Products)
        insertSeedProduct(conn, 71L, "Automotive", "automotive", "Car accessories", "70mai", "70mai A810 4K HDR Front and Rear Dual Dash Cam", "70mai-a810-4k-dual-dashcam",
                "Powered by Sony Starvis 2 IMX678 sensor for ultra-clear 4K UHD video recording, built-in GPS, and 24H AI parking surveillance.",
                18999, 24999, 24, 4.8, 140, 35, "AU-70M-A810-DUAL", true, false,
                "https://images.unsplash.com/photo-1508974239320-0a029497e820?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1508974239320-0a029497e820?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 72L, "Automotive", "automotive", "Cleaning products", "Chemical Guys", "Chemical Guys Complete 16-Piece Car Wash Detailing Kit", "chemical-guys-complete-car-wash-kit",
                "Everything you need to clean, shine, and protect your vehicle exterior and interior with professional foam cannon and microfiber towels.",
                8999, 12999, 31, 4.8, 220, 45, "AU-CG-KIT-16PC", false, true,
                "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 73L, "Automotive", "automotive", "Car accessories", "Baseus", "Baseus 6000mAh Portable Smart Tire Inflator Air Pump", "baseus-portable-tire-inflator",
                "Compact cordless digital tire pump with auto shut-off, emergency LED flashlight, and presets for cars, motorcycles, and bicycles.",
                3499, 4999, 30, 4.7, 310, 70, "AU-BAS-PMP-6K-BLK", false, true,
                "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 74L, "Automotive", "automotive", "Bike accessories", "Quad Lock", "Quad Lock Universal Motorcycle Handlebar Mount Kit", "quad-lock-motorcycle-mount-kit",
                "The strongest and most secure dual-stage lock phone mount for motorcycle and bicycle handlebars with vibration dampener.",
                5499, 6999, 21, 4.9, 180, 40, "AU-QL-MOTO-MNT-PRO", false, false,
                "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 75L, "Automotive", "automotive", "Car accessories", "NOCO", "NOCO Boost HD GB70 2000A UltraSafe Jump Starter", "noco-boost-gb70-jump-starter",
                "Compact 2000-amp lithium jump starter for up to 8.0L gas and 6.0L diesel engines with spark-proof technology.",
                18490, 22990, 20, 4.9, 160, 25, "AU-NOC-GB70-2000A", false, false,
                "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 76L, "Automotive", "automotive", "Interior accessories", "AutoShield", "Custom 7D All-Weather Waterproof Car Floor Mats", "custom-7d-waterproof-car-mats",
                "Precision laser-cut 7-layer diamond stitched floor mats offering edge-to-edge carpet protection against dirt and spills.",
                4999, 7999, 38, 4.7, 240, 50, "AU-AS-7D-MAT-BLK", false, false,
                "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 77L, "Automotive", "automotive", "Cleaning products", "Kärcher", "Kärcher K3 Compact High Pressure Washer 120 Bar", "karcher-k3-compact-pressure-washer",
                "Lightweight and powerful pressure cleaner with Vario Power spray lance and Dirt Blaster for fast vehicle and patio cleaning.",
                11999, 14999, 20, 4.7, 115, 30, "AU-KAR-K3-CMP-120", false, false,
                "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 78L, "Automotive", "automotive", "Car accessories", "Anker", "Anker Roav Bluetooth 5.0 FM Transmitter & Car Charger", "anker-roav-bluetooth-fm-transmitter",
                "Stream music and take hands-free calls through your car radio with dual high-speed USB charging ports and PowerIQ.",
                1999, 2999, 33, 4.7, 420, 85, "AU-ANK-ROV-F2-BLK", false, true,
                "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=700&auto=format&fit=crop&q=85"});

        // 7. TOYS & GAMES (8 Products)
        insertSeedProduct(conn, 79L, "Toys & Games", "toys-games", "Building blocks", "LEGO", "LEGO Icons Porsche 911 Turbo & Targa 2-in-1 Set", "lego-icons-porsche-911-set",
                "Build either the classic Turbo model with turbocharger or the open-top Targa with iconic Targa bar in 1,458 pieces.",
                14999, 17999, 17, 4.9, 240, 20, "TG-LEG-POR-10295", true, true,
                "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 80L, "Toys & Games", "toys-games", "Remote-control toys", "DJI", "DJI Mini 4 Pro 4K HDR Camera Drone with RC 2", "dji-mini-4-pro-drone",
                "Under 249g ultra-lightweight drone with omnidirectional obstacle sensing, 4K/60fps HDR video, and 34-minute flight time.",
                89990, 99990, 10, 4.9, 165, 15, "TG-DJI-MN4P-RC2", true, false,
                "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 81L, "Toys & Games", "toys-games", "Board games", "Catan Studio", "Catan Strategy Board Game (Settlers of Catan)", "catan-strategy-board-game",
                "The world-famous strategy game of trading, building, and settling on the uncharted island of Catan for 3 to 4 players.",
                2999, 3999, 25, 4.8, 580, 65, "TG-CAT-BASE-ENG", false, true,
                "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 82L, "Toys & Games", "toys-games", "Puzzles", "Ravensburger", "Ravensburger 1000-Piece Panorama Jigsaw Puzzle", "ravensburger-1000-piece-puzzle",
                "Crafted with premium FSC-certified cardboard and glare-free linen structured paper with Softclick technology.",
                1499, 2299, 35, 4.7, 140, 75, "TG-RAV-1000-PAN", false, false,
                "https://images.unsplash.com/photo-1563941402622-4e7a488bcc57?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1563941402622-4e7a488bcc57?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 83L, "Toys & Games", "toys-games", "Educational toys", "National Geographic", "National Geographic STEM Solar Space Fleet Robotics Kit", "national-geographic-stem-solar-robot-kit",
                "Build 7 different working space exploration robots powered entirely by direct sunlight or halogen light.",
                2499, 3499, 29, 4.7, 190, 50, "TG-NG-STEM-SOLAR-7", false, false,
                "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 84L, "Toys & Games", "toys-games", "Board games", "Hasbro Gaming", "Hasbro Monopoly Ultimate Banking Electronic Board Game", "monopoly-ultimate-banking-game",
                "The modern electronic edition of Monopoly with all-in-one electronic banking unit, contactless tap cards, and fluctuating property values.",
                2299, 3199, 28, 4.6, 310, 60, "TG-HAS-MON-ULT-BNK", false, false,
                "https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1606167668584-78701c57f13d?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 85L, "Toys & Games", "toys-games", "Building blocks", "Magna-Tiles", "Magna-Tiles 100-Piece Clear Colors Magnetic Building Set", "magna-tiles-100-piece-set",
                "The original 3D magnetic geometric building tiles for open-ended creative construction and spatial learning.",
                6999, 8999, 22, 4.9, 420, 35, "TG-MT-100PC-CLR", false, true,
                "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 86L, "Toys & Games", "toys-games", "Puzzles", "Rubik's", "Rubik’s Connected Smart Bluetooth 3x3 Speed Cube", "rubiks-connected-smart-speed-cube",
                "The classic Rubik’s cube reimagined with smart motion sensors that connect to your phone to teach algorithms and track speed stats.",
                4999, 6499, 23, 4.7, 130, 40, "TG-RUB-CONN-3X3", false, false,
                "https://images.unsplash.com/photo-1591991731833-b4807cf7ef94?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1591991731833-b4807cf7ef94?w=700&auto=format&fit=crop&q=85"});

        // 8. BOOKS & STATIONERY (8 Products)
        insertSeedProduct(conn, 87L, "Books & Stationery", "books-stationery", "Notebooks", "Moleskine", "Moleskine Classic Hardcover Ruled Notebook Large", "moleskine-classic-notebook-large",
                "The legendary notebook with rounded corners, ribbon bookmark, expandable inner pocket, and 70 gsm acid-free ivory pages.",
                1999, 2499, 20, 4.8, 360, 90, "BS-MOL-NB-RUL-BLK", false, true,
                "https://images.unsplash.com/photo-1544816155-12df9643f363?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1544816155-12df9643f363?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 88L, "Books & Stationery", "books-stationery", "Pens", "Lamy", "Lamy 2000 Makrolon Fiberglass Fountain Pen (Medium)", "lamy-2000-fountain-pen-medium",
                "Design icon since 1966 crafted from seamless black fiberglass polycarbonate with platinum-plated 14k gold nib.",
                18500, 22000, 16, 4.9, 140, 25, "BS-LAM-2000-FP-M", false, false,
                "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 89L, "Books & Stationery", "books-stationery", "Art supplies", "Faber-Castell", "Faber-Castell Polychromos Artists’ Colored Pencils (60 Tin)", "faber-castell-polychromos-60-pencils",
                "Valued internationally by professionals for unsurpassed lightfastness, break-resistant 3.8mm leads, and buttery smooth laydown.",
                8499, 10999, 23, 4.9, 280, 35, "BS-FC-POLY-60TIN", false, false,
                "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 90L, "Books & Stationery", "books-stationery", "Books", "Penguin Random House", "Atomic Habits by James Clear (Deluxe Hardcover Edition)", "atomic-habits-james-clear-hardcover",
                "The definitive #1 New York Times bestselling guide to breaking bad behaviors and adopting good habits that last a lifetime.",
                799, 999, 20, 4.9, 1250, 120, "BS-BK-ATOM-HB-ENG", true, true,
                "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 91L, "Books & Stationery", "books-stationery", "Pens", "Parker", "Parker Sonnet Black Lacquer 23k Gold Trim Rollerball Pen", "parker-sonnet-rollerball-pen-gold",
                "A classic expression of refined style with rich gloss black lacquer barrel and 23k gold-plated trims.",
                7499, 9999, 25, 4.8, 110, 40, "BS-PK-SON-RB-BLK", false, false,
                "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 92L, "Books & Stationery", "books-stationery", "Art supplies", "Winsor & Newton", "Winsor & Newton Cotman Watercolor Studio Set (45 Pans)", "winsor-newton-watercolor-studio-set",
                "High quality student and professional artist watercolor set with 45 vibrant half pans, built-in mixing palette, and brush.",
                4999, 6999, 29, 4.8, 185, 45, "BS-WN-COT-45PAN", false, false,
                "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 93L, "Books & Stationery", "books-stationery", "Books", "Harriman House", "The Psychology of Money by Morgan Housel Paperback", "the-psychology-of-money-morgan-housel",
                "Timeless lessons on wealth, greed, and happiness exploring how people think about money through 19 short stories.",
                399, 599, 33, 4.8, 980, 150, "BS-BK-PSYM-PB-ENG", false, true,
                "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 94L, "Books & Stationery", "books-stationery", "Office supplies", "Grovemade", "Grovemade Solid Walnut Wood Ergonomic Monitor Stand", "walnut-wood-monitor-stand-organizer",
                "Elevates your computer screen to ergonomic eye level with integrated slide-out storage tray for pens, drives, and phones.",
                5999, 8499, 29, 4.8, 90, 30, "BS-GM-MNT-WAL-OS", false, false,
                "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=700&auto=format&fit=crop&q=85"});

        // 9. ACCESSORIES (7 Products)
        insertSeedProduct(conn, 95L, "Accessories", "accessories", "Wallets", "Montblanc", "Montblanc Meisterstück European Leather 6CC Wallet", "montblanc-meisterstuck-leather-wallet",
                "European full-grain black cowhide with unique Montblanc deep shine, jacquard lining, and palladium-coated emblem ring.",
                24500, 29000, 16, 4.9, 85, 20, "AC-MB-MST-WLT-6CC", true, false,
                "https://images.unsplash.com/photo-1544816155-12df9643f363?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1544816155-12df9643f363?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 96L, "Accessories", "accessories", "Watches", "Tissot", "Tissot PRX Powermatic 80 Blue Automatic Watch 40mm", "tissot-prx-powermatic-80-blue",
                "Integrated 1978 design with waffle dial, 80-hour power reserve Nivachron balance spring, and sapphire crystal glass.",
                64500, 72000, 10, 4.9, 220, 25, "AC-TIS-PRX-BLU-40", true, true,
                "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 97L, "Accessories", "accessories", "Jewelry", "Tiffany & Co.", "Tiffany & Co. 18k Rose Gold Solitaire Diamond Pendant", "tiffany-rose-gold-diamond-pendant",
                "Iconic round brilliant-cut solitaire diamond set in glowing 18-karat rose gold on a delicate 16-inch link chain.",
                115000, 130000, 12, 5.0, 45, 8, "AC-TIF-DIA-RGD-16", true, false,
                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 98L, "Accessories", "accessories", "Belts", "Gucci", "Gucci Signature Embossed Leather Belt with Double G", "gucci-signature-leather-belt-double-g",
                "Heat-debossed black Gucci Signature leather with smooth leather trim and palladium-toned Double G buckle.",
                36500, 42000, 13, 4.8, 160, 18, "AC-GUC-BLT-BLK-90", false, false,
                "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 99L, "Accessories", "accessories", "Sunglasses", "Persol", "Persol 714 Steve McQueen Folding Polarized Sunglasses", "persol-714-steve-mcqueen-sunglasses",
                "The world’s first folding sunglasses frame worn by Steve McQueen, featuring Meflecto flexible temples and polarized blue gradient lenses.",
                26500, 31000, 15, 4.9, 110, 15, "AC-PER-714-HAV-54", false, false,
                "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1508296695146-257a814070b4?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 100L, "Accessories", "accessories", "Travel accessories", "Bellroy", "Bellroy Apex Slim Passport Sleeve & Travel Pen", "bellroy-apex-passport-sleeve",
                "Precision molded pre-formed leather travel wallet with magnetic snap closure and micro travel pen included.",
                8999, 11999, 25, 4.8, 140, 40, "AC-BEL-APX-PAS-ONY", false, false,
                "https://images.unsplash.com/photo-1544816155-12df9643f363?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1544816155-12df9643f363?w=700&auto=format&fit=crop&q=85"});

        insertSeedProduct(conn, 101L, "Accessories", "accessories", "Travel accessories", "Rimowa", "Rimowa Classic Flight Aluminum Carry-On 36L", "rimowa-classic-flight-aluminum-carry-on",
                "High-end anodized aluminum alloy suitcase with riveted aluminum corners, handmade leather handles, and TSA combination locks.",
                98000, 115000, 15, 4.9, 60, 10, "AC-RIM-CLS-CAB-SLV", true, false,
                "https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=700&auto=format&fit=crop&q=85",
                new String[]{"https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=700&auto=format&fit=crop&q=85"});
    }

    private static void insertSeedProduct(Connection conn, long id, String categoryName, String categorySlug,
                                          String subcatName, String brandName, String name, String slug,
                                          String desc, double price, double origPrice, int discount,
                                          double rating, int reviewCount, int stock, String sku,
                                          boolean featured, boolean bestSeller, String mainImg, String[] galleryImgs) throws SQLException {
        long catId = getOrCreateCategory(conn, categoryName, categorySlug);
        long subcatId = getOrCreateSubcategory(conn, catId, subcatName);
        long brandId = getOrCreateBrand(conn, brandName);

        String sql = "INSERT INTO products (id, category_id, subcategory_id, brand_id, name, slug, description, price, original_price, discount, rating, review_count, stock_quantity, sku, featured, best_seller) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            stmt.setLong(2, catId);
            stmt.setLong(3, subcatId);
            stmt.setLong(4, brandId);
            stmt.setString(5, name);
            stmt.setString(6, slug);
            stmt.setString(7, desc);
            stmt.setBigDecimal(8, BigDecimal.valueOf(price));
            stmt.setBigDecimal(9, BigDecimal.valueOf(origPrice));
            stmt.setInt(10, discount);
            stmt.setBigDecimal(11, BigDecimal.valueOf(rating));
            stmt.setInt(12, reviewCount);
            stmt.setInt(13, stock);
            stmt.setString(14, sku);
            stmt.setBoolean(15, featured);
            stmt.setBoolean(16, bestSeller);
            stmt.executeUpdate();
        }

        // Insert main image
        String imgSql = "INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)";
        try (PreparedStatement stmt = conn.prepareStatement(imgSql)) {
            stmt.setLong(1, id);
            stmt.setString(2, mainImg);
            stmt.setInt(3, 0);
            stmt.executeUpdate();

            if (galleryImgs != null) {
                for (int i = 0; i < galleryImgs.length; i++) {
                    stmt.setLong(1, id);
                    stmt.setString(2, galleryImgs[i]);
                    stmt.setInt(3, i + 1);
                    stmt.executeUpdate();
                }
            }
        }
    }
}
