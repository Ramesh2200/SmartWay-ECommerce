# 03. Application Architecture

## 1. Frontend Component Structure
```mermaid
graph TD
    App["App.jsx"]
    Header["Header.jsx (Autocomplete Search, Auth Menu, Cart Badge)"]
    Footer["Footer.jsx (Trust Badges, Links, Newsletter)"]
    
    subgraph Routes["Page Routes"]
        Home["HomePage.jsx"]
        Products["ProductsPage.jsx (Accordions, Filter Chips)"]
        Details["ProductDetailsPage.jsx (Gallery, Buy Now)"]
        Cart["CartPage.jsx"]
        Checkout["CheckoutPage.jsx (Razorpay)"]
        Orders["OrdersPage.jsx (Tracking, Cancellation)"]
        Profile["ProfilePage.jsx"]
        Login["LoginPage.jsx"]
        Register["RegisterPage.jsx (6-box OTP)"]
        Forgot["ForgotPasswordPage.jsx (4-Step Wizard)"]
    end

    subgraph SharedComponents["Reusable Components"]
        ProductCard["ProductCard.jsx"]
        ProductImage["ProductImage.jsx (Shimmer + Fallbacks)"]
        OtpInput["OtpInput.jsx"]
        Breadcrumb["Breadcrumb.jsx"]
        Skeleton["SkeletonLoader.jsx"]
    end

    App --> Header
    App --> Routes
    App --> Footer
    Products --> ProductCard
    Products --> ProductImage
    Details --> ProductImage
    Orders --> ProductImage
    Register --> OtpInput
    Forgot --> OtpInput
```

## 2. Backend Controller & DAO Mapping
- **`ProductServlet`** $ightarrow$ `ProductDao`: Handles catalog filtering, search, multi-brand queries, pagination, and details.
- **`FilterOptionsServlet`** $ightarrow$ `ProductDao`: Returns dynamic filter metadata and category/brand counts.
- **`OrderServlet`** $ightarrow$ `OrderDao`: Executes transactional order placement, stock decrement, cancellation, and retrieval.
- **`LoginServlet` & `RegisterServlet`** $ightarrow$ `UserService` $ightarrow$ `UserDao`: Handles user verification and credential checks.
- **`SendEmailOtpServlet` & `VerifyEmailOtpServlet`** $ightarrow$ `GmailEmailService` $ightarrow$ `UserDao`: Dispatches 6-digit verification codes.
