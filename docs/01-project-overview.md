# 01. Project Overview

## 1. Vision & Purpose
**SmartWay** is a production-grade, customer-centric e-commerce web platform designed to deliver a modern, fast, and visually stunning shopping experience. The platform features 101+ master products across 9 comprehensive lifestyle categories, backed by real-time MySQL persistence, transactional order placement, Razorpay payment gateway integration, and secure Gmail SMTP 6-digit OTP email verification.

## 2. Target Audience & Personas
- **Online Consumers**: Browsing, discovering, comparing, and purchasing electronics, fashion, home essentials, beauty products, automotive accessories, and sports equipment.
- **Registered Customers**: Managing personal profiles, monitoring order delivery timelines, reordering past purchases, and maintaining wishlists.
- **Guest Shoppers**: Unrestricted catalog search, dynamic accordion filtering, and cart addition prior to seamless authentication at checkout.

## 3. Core Functional Capabilities
- **Master Catalog**: 101 distinct products with verified high-resolution photography and multi-tier SVG fallback support.
- **Search & Accordion Filtering**: Real-time autocomplete suggestions, category/subcategory accordions, brand search with multi-select checkboxes (OR logic), dual price slider presets, star rating filters, and active filter chips.
- **Secure Authentication**: Split-brand login and registration, bcrypt password hashing, 6-digit OTP verification with countdown timer, and 4-step forgot password recovery.
- **Interactive Product Details**: Large centered imagery with hover zoom, thumbnail navigation, quantity selector, and guest "Buy Now" authentication preservation.
- **Payment & Order Checkout**: Two-step checkout with address validation, Razorpay Checkout Gateway (UPI, Cards, NetBanking), Cash on Delivery, and transactional stock updates.
- **Order Management & Tracking**: Unique commercial order numbers (`SW-YYYYMMDD-XXXXXX`), visual 6-step progress timelines, order cancellation, and one-click reordering.

## 4. Non-Functional Requirements
- **Performance**: Sub-300ms frontend bundle builds with Vite; connection-pooled JDBC operations via HikariCP.
- **Security**: Strict SQL injection prevention via PreparedStatement parameterization, zero technical jargon exposed to customers, HTTPS/STARTTLS email transport.
- **Responsiveness**: Mobile-first design with touch-friendly controls, desktop multi-column grids, and zero horizontal scroll.
