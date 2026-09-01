# 25. REST API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Query products with category, subcategory, brand, price, rating, and sort |
| `GET` | `/api/products/{id}` | Get detailed product information |
| `GET` | `/api/products/filter-options` | Get dynamic filter counts for categories and brands |
| `POST` | `/api/auth/login` | Authenticate customer with email and password |
| `POST` | `/api/auth/register` | Register new verified customer account |
| `POST` | `/api/auth/send-email-otp` | Send 6-digit registration OTP via Gmail SMTP |
| `POST` | `/api/auth/verify-email-otp` | Verify registration OTP |
| `POST` | `/api/auth/forgot-password/send-otp` | Send password reset OTP |
| `POST` | `/api/auth/forgot-password/verify-otp` | Verify password reset OTP |
| `POST` | `/api/auth/reset-password` | Update password in MySQL |
| `POST` | `/api/orders` | Create transactional order with order items |
| `GET` | `/api/orders/my-orders` | Retrieve authenticated customer order history |
| `GET` | `/api/orders/{orderId}` | Retrieve individual order details |
| `POST` | `/api/orders/{orderId}/cancel` | Cancel order and restore stock |
