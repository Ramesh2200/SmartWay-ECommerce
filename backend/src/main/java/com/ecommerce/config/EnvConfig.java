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
        return get("MYSQL_HOST", "localhost");
    }

    public static String getDbPort() {
        return get("MYSQL_PORT", "3306");
    }

    public static String getDbName() {
        return get("MYSQL_DATABASE", "ecommerce");
    }

    public static String getDbUser() {
        return get("MYSQL_USERNAME", "root");
    }

    public static String getDbPassword() {
        return get("MYSQL_PASSWORD", "");
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
