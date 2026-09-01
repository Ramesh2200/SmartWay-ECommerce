package com.ecommerce.dao;

import com.ecommerce.config.DatabaseConnection;
import com.ecommerce.model.User;

import java.sql.*;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Data Access Object for Users table.
 * Uses PreparedStatement exclusively.
 */
public class UserDao {

    private static final Logger LOGGER = Logger.getLogger(UserDao.class.getName());

    /**
     * Checks if an email is already registered in users table.
     */
    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE email = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email.trim().toLowerCase());
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error checking email existence: " + e.getMessage(), e);
        }
        return false;
    }

    /**
     * Checks if an email is already registered AND email_verified = true.
     */
    public boolean isEmailVerifiedUser(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE email = ? AND email_verified = TRUE";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email.trim().toLowerCase());
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error checking verified user email: " + e.getMessage(), e);
        }
        return false;
    }

    /**
     * Creates a new user record in MySQL.
     */
    public User createUser(String fullName, String email, String passwordHash, boolean emailVerified) {
        String sql = "INSERT INTO users (full_name, email, password_hash, email_verified, created_at, updated_at) " +
                     "VALUES (?, ?, ?, ?, NOW(), NOW())";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, fullName.trim());
            stmt.setString(2, email.trim().toLowerCase());
            stmt.setString(3, passwordHash);
            stmt.setBoolean(4, emailVerified);

            int affectedRows = stmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        long id = generatedKeys.getLong(1);
                        return findById(id);
                    }
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error creating user: " + e.getMessage(), e);
        }
        return null;
    }

    /**
     * Finds a user by email.
     */
    public User findByEmail(String email) {
        String sql = "SELECT id, full_name, email, password_hash, email_verified, created_at, updated_at " +
                     "FROM users WHERE email = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email.trim().toLowerCase());
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapUser(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error finding user by email: " + e.getMessage(), e);
        }
        return null;
    }

    /**
     * Finds a user by ID.
     */
    public User findById(long id) {
        String sql = "SELECT id, full_name, email, password_hash, email_verified, created_at, updated_at " +
                     "FROM users WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapUser(rs);
                }
            }
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error finding user by id: " + e.getMessage(), e);
        }
        return null;
    }

    /**
     * Updates password hash for a given email.
     */
    public boolean updatePassword(String email, String newPasswordHash) {
        String sql = "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE email = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, newPasswordHash);
            stmt.setString(2, email.trim().toLowerCase());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            LOGGER.log(Level.SEVERE, "Error updating user password: " + e.getMessage(), e);
            return false;
        }
    }

    private User mapUser(ResultSet rs) throws SQLException {
        return new User(
                rs.getLong("id"),
                rs.getString("full_name"),
                rs.getString("email"),
                rs.getString("password_hash"),
                rs.getBoolean("email_verified"),
                rs.getTimestamp("created_at"),
                rs.getTimestamp("updated_at")
        );
    }
}
