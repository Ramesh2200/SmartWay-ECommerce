package com.ecommerce.dao;

import com.ecommerce.config.DatabaseConnection;
import com.ecommerce.model.EmailOtpVerification;

import java.sql.*;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for email_otp_verifications table.
 * Uses PreparedStatement for all SQL executions.
 */
public class OtpDao {

    private static final Logger LOGGER = Logger.getLogger(OtpDao.class.getName());

    /**
     * Saves a newly generated hashed email OTP record with 5-minute expiry.
     */
    public boolean saveOtp(String email, String otpHash, int expiryMinutes) {
        String sql = "INSERT INTO email_otp_verifications (email, otp_hash, expires_at, attempts, verified, created_at) " +
                     "VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), 0, FALSE, NOW())";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email.trim().toLowerCase());
            stmt.setString(2, otpHash);
            stmt.setInt(3, expiryMinutes);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error saving email OTP: " + e.getMessage(), e);
            return false;
        }
    }

    /**
     * Retrieves the latest OTP record for the email.
     */
    public EmailOtpVerification getLatestOtp(String email) {
        String sql = "SELECT id, email, otp_hash, expires_at, attempts, verified, created_at " +
                     "FROM email_otp_verifications WHERE email = ? ORDER BY id DESC LIMIT 1";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email.trim().toLowerCase());
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return new EmailOtpVerification(
                            rs.getLong("id"),
                            rs.getString("email"),
                            rs.getString("otp_hash"),
                            rs.getTimestamp("expires_at"),
                            rs.getInt("attempts"),
                            rs.getBoolean("verified"),
                            rs.getTimestamp("created_at")
                    );
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error retrieving latest email OTP: " + e.getMessage(), e);
        }
        return null;
    }

    /**
     * Increments the attempt counter by 1.
     */
    public void incrementAttempts(long id) {
        String sql = "UPDATE email_otp_verifications SET attempts = attempts + 1 WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            stmt.executeUpdate();
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error incrementing OTP attempts: " + e.getMessage(), e);
        }
    }

    /**
     * Marks an OTP record as verified (single-use).
     */
    public boolean markVerified(long id) {
        String sql = "UPDATE email_otp_verifications SET verified = TRUE WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error marking email OTP verified: " + e.getMessage(), e);
            return false;
        }
    }

    /**
     * Checks whether the email has a verified OTP record within the last 15 minutes.
     */
    public boolean isEmailVerifiedRecently(String email, int validityMinutes) {
        String sql = "SELECT COUNT(*) FROM email_otp_verifications " +
                     "WHERE email = ? AND verified = TRUE AND created_at >= DATE_SUB(NOW(), INTERVAL ? MINUTE)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email.trim().toLowerCase());
            stmt.setInt(2, validityMinutes);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error checking verified email status: " + e.getMessage(), e);
        }
        return false;
    }

    /**
     * Checks seconds elapsed since the last OTP was requested for this email (60-second cooldown).
     */
    public long getSecondsSinceLastOtp(String email) {
        String sql = "SELECT TIMESTAMPDIFF(SECOND, created_at, NOW()) AS elapsed " +
                     "FROM email_otp_verifications WHERE email = ? ORDER BY id DESC LIMIT 1";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email.trim().toLowerCase());
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getLong("elapsed");
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error checking email OTP cooldown: " + e.getMessage(), e);
        }
        return 999;
    }
}
