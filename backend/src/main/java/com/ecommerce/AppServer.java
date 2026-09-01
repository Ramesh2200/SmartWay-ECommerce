package com.ecommerce;

import com.ecommerce.config.DatabaseConnection;
import com.ecommerce.config.DatabaseSeeder;
import com.ecommerce.config.EnvConfig;
import com.ecommerce.controller.*;
import com.ecommerce.filter.CorsFilter;
import jakarta.servlet.DispatcherType;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.FilterHolder;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;

import java.util.EnumSet;

/**
 * Embedded Server Runner for E-Commerce with Master Product Catalog & Gmail Email OTP.
 */
public class AppServer {

    public static void main(String[] args) throws Exception {
        int port = EnvConfig.getServerPort();
        Server server = new Server(port);

        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.setContextPath("/");

        // Add CORS Filter
        context.addFilter(new FilterHolder(new CorsFilter()), "/*", EnumSet.of(DispatcherType.REQUEST));

        // Register Servlets (both under /api and /Ecommerce/api)
        registerServlets(context, "");
        registerServlets(context, "/Ecommerce");

        server.setHandler(context);

        System.out.println("==========================================================");
        System.out.println("  E-COMMERCE MASTER CATALOG & GMAIL OTP SERVER STARTING");
        System.out.println("==========================================================");
        System.out.println(" Port: " + port);
        System.out.println(" API Base URL: http://localhost:" + port + "/api");
        System.out.println(" Tomcat Compatibility URL: http://localhost:" + port + "/Ecommerce/api");
        System.out.println(" Database Status Check: " + (DatabaseConnection.testConnection() ? "CONNECTED (OK)" : "DISCONNECTED (CHECK MYSQL)"));

        // Initialize & Seed Database with 101 Master Products
        try {
            DatabaseSeeder.seedDatabase();
        } catch (Exception e) {
            System.err.println("Warning: Database seeding failed: " + e.getMessage());
        }

        System.out.println(" SMTP Service: Gmail SMTP (smtp.gmail.com:587)");
        System.out.println("==========================================================");

        server.start();
        server.join();
    }

    private static void registerServlets(ServletContextHandler context, String prefix) {
        context.addServlet(new ServletHolder(new SendEmailOtpServlet()), prefix + "/api/auth/send-email-otp");
        context.addServlet(new ServletHolder(new SendEmailOtpServlet()), prefix + "/api/auth/send-otp");
        context.addServlet(new ServletHolder(new VerifyEmailOtpServlet()), prefix + "/api/auth/verify-email-otp");
        context.addServlet(new ServletHolder(new VerifyEmailOtpServlet()), prefix + "/api/auth/verify-otp");
        context.addServlet(new ServletHolder(new TestSmtpServlet()), prefix + "/api/auth/test-smtp");
        context.addServlet(new ServletHolder(new RegisterServlet()), prefix + "/api/auth/register");
        context.addServlet(new ServletHolder(new LoginServlet()), prefix + "/api/auth/login");
        context.addServlet(new ServletHolder(new ForgotPasswordServlet()), prefix + "/api/auth/reset-password");
        context.addServlet(new ServletHolder(new ForgotPasswordSendOtpServlet()), prefix + "/api/auth/forgot-password/send-otp");
        context.addServlet(new ServletHolder(new ForgotPasswordVerifyOtpServlet()), prefix + "/api/auth/forgot-password/verify-otp");
        context.addServlet(new ServletHolder(new FilterOptionsServlet()), prefix + "/api/products/filter-options");
        context.addServlet(new ServletHolder(new ProductServlet()), prefix + "/api/products/*");
        context.addServlet(new ServletHolder(new OrderServlet()), prefix + "/api/orders/*");
        context.addServlet(new ServletHolder(new DatabaseHealthServlet()), prefix + "/api/health");
    }
}
