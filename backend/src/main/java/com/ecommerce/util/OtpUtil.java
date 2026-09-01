package com.ecommerce.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.regex.Pattern;

/**
 * Utility for Secure 6-Digit OTP Generation, SHA-256 Hashing, and Email Validation.
 */
public class OtpUtil {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

    /**
     * Generates a cryptographically secure 6-digit OTP (100000 - 999999).
     */
    public static String generateOtp() {
        int otp = 100000 + SECURE_RANDOM.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Generates SHA-256 hash of the OTP for secure database storage.
     */
    public static String hashOtp(String otp) {
        if (otp == null || otp.trim().isEmpty()) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(otp.trim().getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : encodedHash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Verifies if raw OTP matches the stored SHA-256 hash.
     */
    public static boolean verifyOtp(String rawOtp, String storedHash) {
        if (rawOtp == null || storedHash == null) {
            return false;
        }
        String calculatedHash = hashOtp(rawOtp);
        return calculatedHash.equalsIgnoreCase(storedHash);
    }

    /**
     * Validates if the email address has a valid syntax format.
     */
    public static boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email.trim()).matches();
    }
}
