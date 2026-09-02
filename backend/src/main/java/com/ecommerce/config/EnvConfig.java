package com.ecommerce.config;

import io.github.cdimascio.dotenv.Dotenv;
import java.io.File;

/**
 * Manages configuration and environment variables.
 * Prioritizes system environment variables, then falls back to .env file.
 */
public class EnvConfig {

    private static Dotenv dotenv;

    static {
        try {
            File envFile = new File(".env");
            File parentEnv = new File("../.env");
            File rootEnv = new File("../../.env");

            if (envFile.exists()) {
                dotenv = Dotenv.configure().ignoreIfMissing().load();
            } else if (parentEnv.exists()) {
                dotenv = Dotenv.configure().directory("..").ignoreIfMissing().load();
            } else if (rootEnv.exists()) {
                dotenv = Dotenv.configure().directory("../..").ignoreIfMissing().load();
            } else {
                dotenv = Dotenv.configure().ignoreIfMissing().load();
            }
        } catch (Exception e) {
            dotenv = null;
        }
    }

    /**
     * Retrieves an environment variable by key.
     */
    public static String get(String key) {
        String value = System.getProperty(key);
        if (value != null && !value.trim().isEmpty()) {
            return value.trim();
        }

        value = System.getenv(key);
        if (value != null && !value.trim().isEmpty()) {
            return value.trim();
        }

        if (dotenv != null) {
            try {
                value = dotenv.get(key);
                if (value != null && !value.trim().isEmpty()) {
                    return value.trim();
                }
            } catch (Exception ignored) {}
        }

        return null;
    }

    public static String get(String key, String defaultValue) {
        String value = get(key);
        return (value != null && !value.isEmpty()) ? value : defaultValue;
    }

    // Gmail SMTP Configurations
    public static String getGmailUsername() {
        return get("GMAIL_USERNAME", "");
    }

    public static String getGmailAppPassword() {
        return get("GMAIL_APP_PASSWORD", "");
    }

    public static String getSmtpHost() {
        return get("SMTP_HOST", "smtp.gmail.com");
    }

    public static String getSmtpPort() {
        return get("SMTP_PORT", "587");
    }

    // Database Configurations
    public static String getDbHost() {
        String host = get("MYSQL_HOST");
        if (host == null || host.isEmpty()) host = get("DB_HOST", "localhost");
        return host;
    }

    public static String getDbPort() {
        String port = get("MYSQL_PORT");
        if (port == null || port.isEmpty()) port = get("DB_PORT", "3306");
        return port;
    }

    public static String getDbName() {
        String name = get("MYSQL_DATABASE");
        if (name == null || name.isEmpty()) name = get("DB_NAME", "ecommerce");
        return name;
    }

    public static String getDbUser() {
        String user = get("MYSQL_USERNAME");
        if (user == null || user.isEmpty()) user = get("MYSQL_USER");
        if (user == null || user.isEmpty()) user = get("DB_USER", "root");
        return user;
    }

    public static String getDbPassword() {
        String pass = get("MYSQL_PASSWORD");
        if (pass == null || pass.isEmpty()) pass = get("DB_PASSWORD");
        if (pass == null || pass.isEmpty()) pass = "081506";
        return pass;
    }

    // Server Port
    public static int getServerPort() {
        try {
            return Integer.parseInt(get("PORT", "8080"));
        } catch (NumberFormatException e) {
            return 8080;
        }
    }
}
