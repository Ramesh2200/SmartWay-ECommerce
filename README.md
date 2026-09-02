# SmartWay E-Commerce Platform

> A production-ready, full-stack customer e-commerce web platform featuring 101+ master products, real-time MySQL persistence, Jakarta Servlet backend, Razorpay payment gateway integration, and secure Gmail SMTP email OTP verification.

---

## 🌟 Key Features

- **Master Catalog (101+ Products)**: 9 comprehensive lifestyle categories with verified high-resolution photography and multi-tier SVG fallback pipeline.
- **Search & Accordion Filtering**:
  - Live search autocomplete dropdown with categorized product, brand, and category suggestions.
  - Compact sidebar accordions (Categories, Subcategories, Brands with search and multi-checkboxes, Dual Price presets, Ratings, Discounts, Availability, Offers).
  - Active filter chips with individual dismiss buttons and independent sort dropdown.
- **Product Details & Buying Flow**:
  - Large centered imagery with hover zoom, interactive thumbnail strip with glowing indicator.
  - Interactive quantity selector and customer trust badges (*Fast Delivery*, *7-Day Returns*, *100% Genuine*).
  - Unauthenticated "Buy Now" opens a sign-in modal and preserves target items upon redirect.
- **Payment & Order Processing**:
  - Razorpay Payment Gateway integration (`rzp_live_TUpDWbsYfpR2m7`) supporting UPI, Cards, NetBanking, and Cash on Delivery (COD).
  - ACID transactional order creation with snapshot isolation for product names, images, unit prices, and automatic stock decrement.
  - Unique commercial order numbers (`SW-YYYYMMDD-XXXXXX`).
- **Customer Account & Orders Hub**:
  - Real-time orders retrieved from MySQL (`GET /api/orders/my-orders`).
  - Interactive modal with visual 6-step progress tracker (`Placed` $\rightarrow$ `Confirmed` $\rightarrow$ `Processing` $\rightarrow$ `Shipped` $\rightarrow$ `Out for Delivery` $\rightarrow$ `Delivered`).
  - Interactive order cancellation with automatic stock replenishment and one-click "Buy Again" reordering.
- **Email Verification & Security**:
  - 6-digit OTP verification powered by Gmail SMTP (STARTTLS on port 587) with countdown timer and resend rate-limiting.
  - 4-step forgot password recovery wizard with bcrypt password hashing.
  - Zero exposure of technical or backend jargon on customer pages.

---

## 🏗️ Architecture & Technology Stack

```mermaid
flowchart LR
    CUSTOMER[Customer Browser]
    REACT[React 18 SPA (Vite)]
    API[REST API Layer (Port 8080)]
    SERVLETS[Jakarta Servlets]
    SERVICES[Business Logic & Email]
    DAO[JDBC DAO + HikariCP]
    MYSQL[(MySQL Database)]
    GMAIL[Gmail SMTP]
    RAZORPAY[Razorpay Gateway]

    CUSTOMER --> REACT
    REACT -- "JSON / CORS" --> API
    API --> SERVLETS
    SERVLETS --> SERVICES
    SERVICES --> DAO
    DAO --> MYSQL
    SERVICES -- "STARTTLS" --> GMAIL
    REACT -- "Checkout SDK" --> RAZORPAY
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router v6, Lucide React, Canvas Confetti, Vanilla CSS |
| **Backend** | Java 17 LTS, Jakarta Servlet API, Embedded Jetty, HikariCP, Google Gson |
| **Database** | MySQL 8.0+ with relational foreign keys and automated schema seeder |
| **Integrations**| Razorpay Payment Gateway, Gmail SMTP (Jakarta Mail) |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Java JDK**: 17 LTS or higher
- **Apache Maven**: 3.8+
- **MySQL Server**: 8.0+

### 2. Database & Environment Configuration
Configure your credentials in `.env`:
```env
# MySQL Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=ecommerce
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_password

# Gmail SMTP Email OTP
GMAIL_USERNAME=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_live_TUpDWbsYfpR2m7
VITE_RAZORPAY_KEY_ID=rzp_live_TUpDWbsYfpR2m7

# Server
PORT=8080
CORS_ALLOWED_ORIGIN=http://localhost:5173
```

### 3. Run Backend Server
```bash
cd backend
mvn clean compile
mvn exec:java
```
*The backend automatically seeds the MySQL database schema and 101 master products on initial startup.*

### 4. Run Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 REST API Reference

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Retrieve catalog with search, category, brand, and sort filters |
| `GET` | `/api/products/{id}` | Get product details by ID |
| `GET` | `/api/products/filter-options` | Dynamic product counts for filters |
| `POST` | `/api/auth/register` | Register new customer account |
| `POST` | `/api/auth/login` | Authenticate customer |
| `POST` | `/api/auth/send-email-otp` | Dispatch 6-digit registration OTP via Gmail |
| `POST` | `/api/auth/verify-email-otp` | Verify 6-digit registration OTP |
| `POST` | `/api/auth/forgot-password/send-otp` | Dispatch password recovery OTP |
| `POST` | `/api/auth/reset-password` | Update account password in MySQL |
| `POST` | `/api/orders` | Place order within ACID database transaction |
| `GET` | `/api/orders/my-orders` | Fetch customer order history |
| `POST` | `/api/orders/{id}/cancel` | Cancel order and restore product stock |

---

## 📖 Complete Documentation

Explore the complete **38-part technical documentation suite** inside the [`docs/`](./docs/README.md) directory:

1. [Project Overview](./docs/01-project-overview.md)
2. [System Architecture](./docs/02-system-architecture.md)
3. [Application Architecture](./docs/03-application-architecture.md)
4. [Folder Structure](./docs/04-folder-structure.md)
5. [Technology Stack](./docs/05-technology-stack.md)
6. [Database Architecture & Schema](./docs/06-database-architecture.md)
7. [Authentication & Email OTP](./docs/08-authentication-flow.md)
8. [Payment Gateway Integration](./docs/21-payment-flow.md)
9. [Order Transaction Lifecycle](./docs/19-order-flow.md)
10. [API & Postman Collection](./docs/25-api-documentation.md)
11. [Sequence & Architecture Diagrams](./docs/33-sequence-diagrams.md)

---

## 📦 Project Download & Packaging

To package the entire project into a clean archive:
```bash
zip -r smartway-ecommerce-complete.zip . -x "node_modules/*" "backend/target/*" ".git/*" "frontend/dist/*"
```
The download archive is available at [`smartway-ecommerce-complete.zip`](./smartway-ecommerce-complete.zip).
