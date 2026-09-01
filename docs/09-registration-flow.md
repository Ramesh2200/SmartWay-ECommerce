# 09. Registration Flow

## 1. Flow Breakdown
1. **User Input**: Customer submits Full Name, Email, Password, and Confirm Password on `/register`.
2. **Password Strength Meter**: Real-time evaluation of length, numbers, and symbols.
3. **OTP Generation & Dispatch**: Backend verifies email is not registered, generates 6-digit OTP, stores hash with 5-minute expiry in memory/cache, and sends formatted HTML email via Gmail SMTP.
4. **Verification Step**: Customer inputs 6 digits into `<OtpInput>`.
5. **Account Creation**: On valid code verification, backend inserts user into `users` table with `email_verified = true` and returns the user object.
