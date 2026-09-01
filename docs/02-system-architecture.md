# 02. System Architecture

## 1. High-Level Architecture
SmartWay implements a multi-tier Client-Server architecture with separation of concerns between presentation, business logic, persistence, and external service providers.

```mermaid
flowchart TD
    subgraph ClientTier["Client Tier (Browser)"]
        UI["React 18 SPA (Vite)"]
        State["Context State (Auth, Cart, Wishlist, Toast)"]
        API_CLIENT["REST API Client (Fetch with Credentials)"]
    end

    subgraph AppTier["Application Server Tier (Port 8080)"]
        CORS["CORS Filter"]
        SERVLETS["Jakarta Servlet Controllers (Product, Order, Auth, OTP)"]
        SERVICES["Business Services (UserService, GmailEmailService)"]
        DAO["Data Access Objects (ProductDao, OrderDao, UserDao)"]
        POOL["HikariCP Connection Pool"]
    end

    subgraph DataTier["Data Tier (MySQL 8.0)"]
        MYSQL[("MySQL Database (ecommerce)")]
    end

    subgraph ExternalTier["External Services"]
        GMAIL["Gmail SMTP (smtp.gmail.com:587)"]
        RAZORPAY["Razorpay Payment Gateway API"]
    end

    UI --> State
    State --> API_CLIENT
    API_CLIENT -- "HTTP / JSON (Port 8080)" --> CORS
    CORS --> SERVLETS
    SERVLETS --> SERVICES
    SERVICES --> DAO
    DAO --> POOL
    POOL --> MYSQL
    SERVICES -- "STARTTLS" --> GMAIL
    UI -- "Razorpay Checkout JS" --> RAZORPAY
```

## 2. Architectural Layers
1. **Presentation Layer**: Single Page Application built on React 18, React Router v6, Lucide React icons, and vanilla CSS custom properties.
2. **Controller / REST API Layer**: Jakarta Servlets (`@WebServlet`) mounted on `/api/*` handling CORS, payload deserialization via Google Gson, and HTTP status codes.
3. **Service Layer**: Handles business logic, email generation, OTP validation, and authentication checks.
4. **Data Access Layer (DAO)**: Pure JDBC DAOs with HikariCP connection pooling, parameterized queries, and ACID database transactions.
5. **Persistence Layer**: Relational MySQL database with foreign keys, indexes, and automated schema seeders.
