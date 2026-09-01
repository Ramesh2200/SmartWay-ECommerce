package com.ecommerce.controller;

import com.ecommerce.config.DatabaseConnection;
import com.ecommerce.config.EnvConfig;
import com.ecommerce.util.JsonUtil;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/api/health")
public class DatabaseHealthServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        boolean dbConnected = DatabaseConnection.testConnection();
        boolean gmailConfigured = !EnvConfig.getGmailUsername().isEmpty() &&
                                  !EnvConfig.getGmailUsername().contains("yourgmail") &&
                                  !EnvConfig.getGmailAppPassword().isEmpty() &&
                                  !EnvConfig.getGmailAppPassword().contains("your_app_password");

        JsonObject status = new JsonObject();
        status.addProperty("status", dbConnected ? "UP" : "DEGRADED");
        status.addProperty("database_connected", dbConnected);
        status.addProperty("database_name", EnvConfig.getDbName());
        status.addProperty("database_host", EnvConfig.getDbHost());
        status.addProperty("email_service", "Gmail SMTP");
        status.addProperty("smtp_host", EnvConfig.getSmtpHost());
        status.addProperty("smtp_port", EnvConfig.getSmtpPort());
        status.addProperty("gmail_configured", gmailConfigured);
        status.addProperty("timestamp", System.currentTimeMillis());

        JsonUtil.sendSuccessWithData(response, "System health status check", status);
    }
}
