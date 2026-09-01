package com.ecommerce.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * High-performance JDBC Connection Manager using HikariCP.
 * Safely loads credentials from EnvConfig without hardcoding passwords.
 */
public class DatabaseConnection {

    private static final Logger LOGGER = Logger.getLogger(DatabaseConnection.class.getName());
    private static HikariDataSource dataSource;

    static {
        initDataSource();
    }

    private static synchronized void initDataSource() {
        if (dataSource != null && !dataSource.isClosed()) {
            return;
        }

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            String host = EnvConfig.getDbHost();
            String port = EnvConfig.getDbPort();
            String database = EnvConfig.getDbName();
            String username = EnvConfig.getDbUser();
            String password = EnvConfig.getDbPassword();

            String jdbcUrl = String.format("jdbc:mysql://%s:%s/%s?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8",
                    host, port, database);

            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(jdbcUrl);
            config.setUsername(username);
            config.setPassword(password);
            config.setDriverClassName("com.mysql.cj.jdbc.Driver");

            config.setMaximumPoolSize(15);
            config.setMinimumIdle(3);
            config.setIdleTimeout(300000);
            config.setConnectionTimeout(20000);
            config.setMaxLifetime(1200000);
            config.setPoolName("EcommerceHikariPool");

            // Recommended MySQL performance properties
            config.addDataSourceProperty("cachePrepStmts", "true");
            config.addDataSourceProperty("prepStmtCacheSize", "250");
            config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
            config.addDataSourceProperty("useServerPrepStmts", "true");

            dataSource = new HikariDataSource(config);
            LOGGER.info("HikariCP Connection Pool initialized successfully for MySQL database: " + database);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Failed to initialize HikariCP pool. Falling back to direct DriverManager: " + e.getMessage(), e);
        }
    }

    /**
     * Obtains a Connection from the pool or direct fallback.
     */
    public static Connection getConnection() throws SQLException {
        if (dataSource != null && !dataSource.isClosed()) {
            try {
                return dataSource.getConnection();
            } catch (SQLException e) {
                LOGGER.warning("HikariCP pool acquisition failed, attempting direct connection: " + e.getMessage());
            }
        }

        // Direct connection fallback
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            String host = EnvConfig.getDbHost();
            String port = EnvConfig.getDbPort();
            String database = EnvConfig.getDbName();
            String username = EnvConfig.getDbUser();
            String password = EnvConfig.getDbPassword();

            String jdbcUrl = String.format("jdbc:mysql://%s:%s/%s?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8",
                    host, port, database);

            return DriverManager.getConnection(jdbcUrl, username, password);
        } catch (ClassNotFoundException e) {
            throw new SQLException("MySQL JDBC Driver not found: " + e.getMessage(), e);
        }
    }

    /**
     * Tests the database connection and returns status message.
     */
    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed() && conn.isValid(3);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Database connection test failed: " + e.getMessage());
            return false;
        }
    }

    /**
     * Gracefully shuts down the connection pool.
     */
    public static void closePool() {
        if (dataSource != null && !dataSource.isClosed()) {
            dataSource.close();
            LOGGER.info("HikariCP pool shut down.");
        }
    }
}
