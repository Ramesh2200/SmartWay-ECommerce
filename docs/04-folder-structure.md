# 04. Folder Structure

```
ecommerce-twilio-otp/
├── .env                              # Master environment configuration (MySQL, SMTP, Razorpay)
├── .env.example                      # Template environment variables
├── README.md                         # Master project documentation
├── pom.xml                           # Backend Maven build configuration (Java 17, Jetty, HikariCP)
│
├── backend/                          # Java Servlet Backend
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/ecommerce/
│       │   ├── AppServer.java        # Embedded Jetty Server entrypoint & route registration
│       │   ├── config/               # Database Connection & Master Schema Seeder
│       │   ├── controller/           # Jakarta Servlets (Auth, Orders, Products, OTP, Filter)
│       │   ├── dao/                  # Data Access Objects (UserDao, ProductDao, OrderDao)
│       │   ├── filter/               # CorsFilter
│       │   ├── model/                # Java Data Models (User, Product, Order, OrderItem, Category)
│       │   ├── service/              # Business logic (UserService, GmailEmailService)
│       │   └── util/                 # JsonUtil (Gson helper)
│       └── resources/
│           ├── application.properties
│           └── schema_master.sql     # Master MySQL relational schema
│
├── frontend/                         # React 18 SPA Frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html                    # Root HTML with Google Fonts & Razorpay SDK
│   ├── public/
│   │   └── images/fallback/          # Vector SVG category fallbacks
│   └── src/
│       ├── App.jsx                   # Master routing & provider wrapping
│       ├── main.jsx                  # React DOM root entry
│       ├── index.css                 # Master Design System, variables & animations
│       ├── components/               # Header, Footer, ProductCard, ProductImage, OtpInput
│       ├── context/                  # AuthContext, CartContext, WishlistContext, ToastContext
│       ├── data/                     # 101 master products & category data definitions
│       ├── pages/                    # Home, Products, ProductDetails, Cart, Checkout, Orders, Auth
│       └── services/api.js           # REST API client with credentials support
│
└── docs/                             # Comprehensive 38-part technical documentation suite
```
