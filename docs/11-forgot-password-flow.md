# 11. Forgot Password Flow

## 4-Step Password Recovery Wizard
1. **Step 1 (Email Entry)**: Customer enters registered email.
2. **Step 2 (6-Box OTP Verification)**: Enters 6-digit verification code sent to Gmail.
3. **Step 3 (New Password)**: Enters and confirms new password (min 6 characters).
4. **Step 4 (Success Confirmation)**: Password updated in MySQL with salted bcrypt hash; directs customer to Sign In.
