-- ========================================================
-- E-Commerce Database Schema with REAL Gmail Email OTP Authentication
-- ========================================================

CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

-- Drop obsolete tables if existing
DROP TABLE IF EXISTS email_otp_verifications;
DROP TABLE IF EXISTS otp_verifications;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;

-- 1. USERS TABLE
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. EMAIL OTP VERIFICATIONS TABLE
CREATE TABLE email_otp_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    attempts INT DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_otp (email),
    INDEX idx_email_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 4.5,
    description TEXT,
    image_url VARCHAR(500),
    stock INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'COMPLETED',
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'COD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================================
-- SEED INITIAL PRODUCTS CATALOG
-- ========================================================
INSERT INTO products (name, category, price, rating, description, image_url, stock) VALUES
('Apple iPhone 15 Pro Max', 'Smartphones', 134900.00, 4.85, 'Titanium design with A17 Pro chip, 48MP camera, and Action button.', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80', 25),
('Sony WH-1000XM5 Wireless Headphones', 'Audio', 29990.00, 4.78, 'Industry-leading noise cancellation with 30-hour battery life.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', 40),
('Apple MacBook Pro 14" M3', 'Laptops', 169900.00, 4.90, 'Blazing fast M3 chip with Liquid Retina XDR display and 18h battery.', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80', 15),
('Samsung Galaxy S24 Ultra', 'Smartphones', 129999.00, 4.80, 'Galaxy AI powered flagship with built-in S Pen and 200MP camera.', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80', 20),
('Apple Watch Series 9', 'Wearables', 41900.00, 4.65, 'S9 SiP chip with Double Tap gesture, always-on Retina display.', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80', 35),
('Dell UltraSharp 27" 4K Monitor', 'Accessories', 48500.00, 4.70, 'IPS Black panel with 2000:1 contrast ratio and USB-C hub connectivity.', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80', 18),
('Logitech MX Master 3S Wireless Mouse', 'Accessories', 8995.00, 4.92, 'Quiet clicks with 8K DPI sensor and MagSpeed electromagnetic scrolling.', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80', 50),
('Bose SoundLink Revolve+ II', 'Audio', 24500.00, 4.60, 'True 360-degree portable Bluetooth speaker with deep bass.', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80', 28)
ON DUPLICATE KEY UPDATE name=VALUES(name);
