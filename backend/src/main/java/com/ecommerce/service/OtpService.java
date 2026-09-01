package com.ecommerce.service;

import com.ecommerce.dao.OtpDao;
import com.ecommerce.dao.UserDao;
import com.ecommerce.model.EmailOtpVerification;
import com.ecommerce.model.User;
import com.ecommerce.util.OtpUtil;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.logging.Logger;

/**
 * Service managing Email OTP generation, Gmail SMTP dispatch, 5-minute expiry, and verification logic.
 * Enforces strict separation between Registration OTP and Forgot Password OTP.
 */
public class OtpService {

    private static final Logger LOGGER = Logger.getLogger(OtpService.class.getName());
    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_ATTEMPTS = 5;
    private static final int RESEND_COOLDOWN_SECONDS = 60;

    private final OtpDao otpDao = new OtpDao();
    private final UserDao userDao = new UserDao();

    public static class OtpResult {
        private final boolean success;
        private final String message;
        private final long cooldownRemaining;
        private final boolean alreadyAuthenticated;

        public OtpResult(boolean success, String message) {
            this(success, message, 0, false);
        }

        public OtpResult(boolean success, String message, long cooldownRemaining) {
            this(success, message, cooldownRemaining, false);
        }

        public OtpResult(boolean success, String message, long cooldownRemaining, boolean alreadyAuthenticated) {
            this.success = success;
            this.message = message;
            this.cooldownRemaining = cooldownRemaining;
            this.alreadyAuthenticated = alreadyAuthenticated;
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public long getCooldownRemaining() { return cooldownRemaining; }
        public boolean isAlreadyAuthenticated() { return alreadyAuthenticated; }
    }

    /**
     * Dispatches OTP for Registration purpose.
     * Rejects if email is already registered and verified.
     */
    public OtpResult sendRegistrationOtp(String rawEmail) {
        if (rawEmail == null || rawEmail.trim().isEmpty()) {
            return new OtpResult(false, "Email address is required");
        }

        String email = rawEmail.trim().toLowerCase();

        if (!OtpUtil.isValidEmail(email)) {
            return new OtpResult(false, "Invalid email address format");
        }

        // 1. Check users table: If email is already registered and verified, abort registration OTP!
        if (userDao.isEmailVerifiedUser(email)) {
            LOGGER.info("Email " + GmailEmailService.maskEmail(email) + " is already registered. Registration OTP aborted.");
            return new OtpResult(false, "This email is already registered. Please login.", 0, true);
        }

        // 2. Check 60-second cooldown
        long elapsedSeconds = otpDao.getSecondsSinceLastOtp(email);
        if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
            long remaining = RESEND_COOLDOWN_SECONDS - elapsedSeconds;
            return new OtpResult(false, "Please wait " + remaining + " seconds before requesting a new code", remaining, false);
        }

        // 3. Generate 6-digit OTP
        String otp = OtpUtil.generateOtp();

        // 4. Dispatch Email via Gmail SMTP
        GmailEmailService.SmtpSendResult smtpResult = GmailEmailService.sendRegistrationOtp(email, otp);
        if (!smtpResult.isSuccess()) {
            return new OtpResult(false, smtpResult.getMessage());
        }

        // 5. Store OTP hash in MySQL
        String otpHash = OtpUtil.hashOtp(otp);
        boolean saved = otpDao.saveOtp(email, otpHash, OTP_EXPIRY_MINUTES);
        if (!saved) {
            return new OtpResult(false, "Failed to record verification session. Please try again.");
        }

        return new OtpResult(true, "Verification code sent to your email");
    }

    /**
     * Dispatches OTP for Forgot Password / Password Reset purpose.
     * Enforces that the user account MUST EXIST. Does NOT reject existing email!
     */
    public OtpResult sendForgotPasswordOtp(String rawEmail) {
        if (rawEmail == null || rawEmail.trim().isEmpty()) {
            return new OtpResult(false, "Email address is required");
        }

        String email = rawEmail.trim().toLowerCase();

        if (!OtpUtil.isValidEmail(email)) {
            return new OtpResult(false, "Invalid email address format");
        }

        // 1. Verify user exists in database
        User existingUser = userDao.findByEmail(email);
        if (existingUser == null) {
            LOGGER.info("Forgot password requested for non-existent email: " + GmailEmailService.maskEmail(email));
            return new OtpResult(false, "No registered account found with this email address");
        }

        // 2. Check 60-second cooldown
        long elapsedSeconds = otpDao.getSecondsSinceLastOtp(email);
        if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
            long remaining = RESEND_COOLDOWN_SECONDS - elapsedSeconds;
            return new OtpResult(false, "Please wait " + remaining + " seconds before requesting a new code", remaining, false);
        }

        // 3. Generate 6-digit OTP
        String otp = OtpUtil.generateOtp();

        // 4. Dispatch Password Reset OTP Email
        GmailEmailService.SmtpSendResult smtpResult = GmailEmailService.sendPasswordResetOtp(email, otp);
        if (!smtpResult.isSuccess()) {
            return new OtpResult(false, smtpResult.getMessage());
        }

        // 5. Store OTP hash in MySQL
        String otpHash = OtpUtil.hashOtp(otp);
        boolean saved = otpDao.saveOtp(email, otpHash, OTP_EXPIRY_MINUTES);
        if (!saved) {
            return new OtpResult(false, "Failed to record password reset session. Please try again.");
        }

        return new OtpResult(true, "Password reset code sent to your email");
    }

    public OtpResult sendOtp(String rawEmail) {
        return sendRegistrationOtp(rawEmail);
    }

    /**
     * Verifies OTP for both Registration and Password Reset.
     */
    public OtpResult verifyOtp(String rawEmail, String rawOtp) {
        if (rawEmail == null || rawEmail.trim().isEmpty()) {
            return new OtpResult(false, "Email address is required");
        }

        if (rawOtp == null || rawOtp.trim().isEmpty() || rawOtp.trim().length() != 6) {
            return new OtpResult(false, "Invalid code format. Must be a 6-digit code.");
        }

        String email = rawEmail.trim().toLowerCase();
        String otp = rawOtp.trim();

        EmailOtpVerification record = otpDao.getLatestOtp(email);
        if (record == null) {
            return new OtpResult(false, "No active verification request found for this email");
        }

        if (record.isVerified()) {
            return new OtpResult(false, "This verification code has already been used. Please request a new code.");
        }

        if (record.getAttempts() >= MAX_ATTEMPTS) {
            return new OtpResult(false, "Too many verification attempts. Please request a new code.");
        }

        Timestamp now = Timestamp.from(Instant.now());
        if (record.getExpiresAt() == null || now.after(record.getExpiresAt())) {
            return new OtpResult(false, "Verification code has expired. Please request a new code.");
        }

        otpDao.incrementAttempts(record.getId());

        boolean matches = OtpUtil.verifyOtp(otp, record.getOtpHash());
        if (!matches) {
            int remainingAttempts = MAX_ATTEMPTS - (record.getAttempts() + 1);
            if (remainingAttempts <= 0) {
                return new OtpResult(false, "Too many verification attempts");
            }
            return new OtpResult(false, "Invalid verification code");
        }

        otpDao.markVerified(record.getId());
        return new OtpResult(true, "Email verified successfully");
    }

    public boolean isEmailVerified(String email) {
        if (email == null) return false;
        return otpDao.isEmailVerifiedRecently(email.trim().toLowerCase(), 15);
    }
}
