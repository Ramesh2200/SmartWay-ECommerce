# SmartWay E-Commerce — Master Documentation Index

Welcome to the comprehensive technical and architectural documentation for the **SmartWay E-Commerce Platform**.

## 📚 Documentation Index

| Section | Document | Description |
| :--- | :--- | :--- |
| **01** | [Project Overview](./01-project-overview.md) | Vision, audience, customer features, functional & non-functional requirements |
| **02** | [System Architecture](./02-system-architecture.md) | High-level system architecture, client-server tier, data flow |
| **03** | [Application Architecture](./03-application-architecture.md) | Component architecture, React frontend, Java Servlet backend, and state layers |
| **04** | [Folder Structure](./04-folder-structure.md) | Complete directory tree breakdown for frontend, backend, and configs |
| **05** | [Technology Stack](./05-technology-stack.md) | Detailed breakdown of React 18, Vite, Java 17, HikariCP, MySQL, Razorpay, Gmail SMTP |
| **06** | [Database Architecture](./06-database-architecture.md) | Relational database design, connection pooling, indexing, and foreign keys |
| **07** | [Database Schema](./07-database-schema.md) | Complete SQL table definitions with column types, constraints, and defaults |
| **08** | [Authentication Flow](./08-authentication-flow.md) | End-to-end authentication lifecycle, sessions, and route guards |
| **09** | [Registration Flow](./09-registration-flow.md) | Account signup, password validation, and email verification pipeline |
| **10** | [Email OTP Flow](./10-email-otp-flow.md) | 6-digit OTP generation, SHA-256 hashing, 5-min expiration, and resend cooldown |
| **11** | [Forgot Password Flow](./11-forgot-password-flow.md) | 4-step password recovery wizard with OTP verification and bcrypt hashing |
| **12** | [Login Flow](./12-login-flow.md) | User credential verification, redirect preservation, and session establishment |
| **13** | [Product Catalog Flow](./13-product-catalog-flow.md) | 101+ master products, 9 categories, subcategories, and brands |
| **14** | [Search, Filter & Sort Flow](./14-search-filter-sort-flow.md) | Accordion filters, multi-brand search, price presets, and independent sorting |
| **15** | [Product Details Flow](./15-product-details-flow.md) | Interactive image gallery, zoom, stock indicators, and buy now guest modal |
| **16** | [Wishlist Flow](./16-wishlist-flow.md) | Customer wishlist persistence, toggle actions, and badge synchronization |
| **17** | [Cart Flow](./17-cart-flow.md) | Shopping cart state management, quantity modifications, and price calculations |
| **18** | [Checkout Flow](./18-checkout-flow.md) | Two-step checkout wizard, shipping address validation, and payment selection |
| **19** | [Order Flow](./19-order-flow.md) | Transactional order placement, immutable snapshot isolation, stock decrement |
| **20** | [My Account Flow](./20-my-account-flow.md) | Customer profile management, order history, tracking timelines, and cancellation |
| **21** | [Payment Flow](./21-payment-flow.md) | Razorpay payment gateway integration (UPI, Cards, NetBanking, COD) |
| **22** | [Email Service](./22-email-service.md) | Gmail SMTP configuration with STARTTLS on port 587 and HTML templates |
| **23** | [Security](./23-security.md) | PreparedStatement SQL safety, bcrypt password hashing, session guards, zero technical exposure |
| **24** | [Error Handling](./24-error-handling.md) | Client-side error boundaries, toast notifications, and backend JSON error standards |
| **25** | [API Documentation](./25-api-documentation.md) | Comprehensive REST API reference with endpoints, parameters, and payloads |
| **26** | [Postman Testing](./26-postman-testing.md) | Guide to executing the included Postman collection against local and remote servers |
| **27** | [Test Cases](./27-test-cases.md) | Manual and automated test cases covering authentication, catalog, cart, and orders |
| **28** | [Deployment](./28-deployment.md) | Production build guidelines for Vite frontend, Tomcat/Jetty WAR, and MySQL |
| **29** | [Environment Configuration](./29-environment-configuration.md) | Full .env reference for database, SMTP credentials, and Razorpay API keys |
| **30** | [Troubleshooting](./30-troubleshooting.md) | Common issues, database connection errors, SMTP timeout resolution, and port conflicts |
| **31** | [Development Workflow](./31-development-workflow.md) | Local pair programming guide, hot-reloading, Maven lifecycle, and build scripts |
| **32** | [Complete User Workflow](./32-complete-user-workflow.md) | Step-by-step customer journey from homepage discovery to delivery receipt |
| **33** | [Sequence Diagrams](./33-sequence-diagrams.md) | Mermaid sequence diagrams for Auth, Checkout, OTP, and Order cancellation |
| **34** | [Architecture Diagrams](./34-architecture-diagrams.md) | Comprehensive component diagrams, physical deployment, and container views |
| **35** | [Data Flow Diagrams](./35-data-flow-diagrams.md) | DFD Level 0, Level 1, and Level 2 diagrams for order processing |
| **36** | [JSON Examples](./36-json-examples.md) | Exact request and response JSON payloads for all API endpoints |
| **37** | [Glossary](./37-glossary.md) | Domain terminology, abbreviations, and architectural definitions |
| **38** | [Future Improvements](./38-future-improvements.md) | Roadmap for reviews, coupons, live courier webhook tracking, and PWA support |
