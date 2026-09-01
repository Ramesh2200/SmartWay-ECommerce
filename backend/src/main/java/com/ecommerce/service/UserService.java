package com.ecommerce.service;

import com.ecommerce.dao.UserDao;
import com.ecommerce.model.User;
import com.ecommerce.util.OtpUtil;
import com.ecommerce.util.PasswordUtil;

/**
 * Service managing user registration, authentication, and profile operations.
 */
public class UserService {

    private final UserDao userDao = new UserDao();
    private final OtpService otpService = new OtpService();

    public static class UserResult {
        private final boolean success;
        private final String message;
        private final User user;

        public UserResult(boolean success, String message) {
            this(success, message, null);
        }

        public UserResult(boolean success, String message, User user) {
            this.success = success;
            this.message = message;
            this.user = user;
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public User getUser() { return user; }
    }

    /**
     * Registers a new user.
     * Enforces that the email address has already been verified via Email OTP.
     */
    public UserResult register(String fullName, String email, String rawPassword) {
        if (fullName == null || fullName.trim().isEmpty()) {
            return new UserResult(false, "Full name is required");
        }
        if (email == null || !OtpUtil.isValidEmail(email)) {
            return new UserResult(false, "A valid email address is required");
        }
        if (rawPassword == null || rawPassword.length() < 6) {
            return new UserResult(false, "Password must be at least 6 characters long");
        }

        String cleanEmail = email.trim().toLowerCase();

        // 1. Enforce Email OTP Verification Requirement
        if (!otpService.isEmailVerified(cleanEmail)) {
            return new UserResult(false, "Email has not been verified with OTP. Please complete email OTP verification first.");
        }

        // 2. Prevent Duplicate Email Registration
        if (userDao.existsByEmail(cleanEmail)) {
            return new UserResult(false, "Email is already registered. Please login or use another email.");
        }

        // 3. Hash Password with BCrypt (12 rounds)
        String passwordHash = PasswordUtil.hashPassword(rawPassword);

        // 4. Create user in MySQL with email_verified = true
        User user = userDao.createUser(fullName, cleanEmail, passwordHash, true);
        if (user == null) {
            return new UserResult(false, "Registration failed due to a database error. Please try again.");
        }

        return new UserResult(true, "User registered successfully", user);
    }

    /**
     * Authenticates user using email and password.
     */
    public UserResult login(String email, String rawPassword) {
        if (email == null || email.trim().isEmpty()) {
            return new UserResult(false, "Email address is required");
        }
        if (rawPassword == null || rawPassword.isEmpty()) {
            return new UserResult(false, "Password is required");
        }

        String cleanEmail = email.trim().toLowerCase();
        User user = userDao.findByEmail(cleanEmail);

        if (user == null) {
            return new UserResult(false, "Invalid email or password");
        }

        if (!PasswordUtil.checkPassword(rawPassword, user.getPasswordHash())) {
            return new UserResult(false, "Invalid email or password");
        }

        return new UserResult(true, "Login successful", user);
    }

    /**
     * Resets password after email OTP verification.
     */
    public UserResult resetPassword(String email, String newPassword) {
        if (email == null || !OtpUtil.isValidEmail(email)) {
            return new UserResult(false, "Invalid email address");
        }
        if (newPassword == null || newPassword.length() < 6) {
            return new UserResult(false, "New password must be at least 6 characters long");
        }

        String cleanEmail = email.trim().toLowerCase();

        if (!otpService.isEmailVerified(cleanEmail)) {
            return new UserResult(false, "Email must be OTP verified before resetting password");
        }

        if (!userDao.existsByEmail(cleanEmail)) {
            return new UserResult(false, "No account found associated with this email");
        }

        String newHash = PasswordUtil.hashPassword(newPassword);
        boolean updated = userDao.updatePassword(cleanEmail, newHash);
        if (!updated) {
            return new UserResult(false, "Failed to update password. Please try again.");
        }

        return new UserResult(true, "Password updated successfully. You can now login.");
    }
}
