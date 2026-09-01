# 08. Authentication Flow

## 1. Overview
SmartWay supports guest discovery with mandatory authentication prior to checkout. Authentication leverages email verification via Gmail SMTP OTP, salted bcrypt passwords, and HTTP sessions.

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Frontend as React Frontend
    participant Server as LoginServlet
    participant DB as MySQL Database

    Customer->>Frontend: Enter Email & Password
    Frontend->>Server: POST /api/auth/login { email, password }
    Server->>DB: SELECT * FROM users WHERE email = ?
    DB-->>Server: Return user row with password_hash
    Server->>Server: BCrypt.checkpw(password, hash)
    alt Valid Credentials
        Server->>Server: session.setAttribute("user", user)
        Server-->>Frontend: HTTP 200 { success: true, data: user }
        Frontend->>Frontend: Save user in AuthContext & localStorage
        Frontend->>Customer: Redirect to /checkout or /profile
    else Invalid Password
        Server-->>Frontend: HTTP 401 { success: false, message: "Invalid email or password" }
        Frontend->>Customer: Display error toast
    end
```
