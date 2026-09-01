package com.ecommerce.service;

import com.ecommerce.config.EnvConfig;
import com.ecommerce.util.OtpUtil;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Service responsible for sending verification emails via Gmail SMTP (smtp.gmail.com:587).
 * Strictly requires real Transport.send() delivery to succeed before reporting success.
 */
public class GmailEmailService {

    private static final Logger LOGGER = Logger.getLogger(GmailEmailService.class.getName());

    public static class SmtpSendResult {
        private final boolean success;
        private final String message;

        public SmtpSendResult(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
    }

    public static boolean isConfigured() {
        String username = EnvConfig.getGmailUsername();
        String password = EnvConfig.getGmailAppPassword();
        return username != null && !username.trim().isEmpty() && !username.contains("yourgmail") &&
               password != null && !password.trim().isEmpty() && !password.contains("your_app_password");
    }

    public static void logDiagnostics() {
        String username = EnvConfig.getGmailUsername();
        String password = EnvConfig.getGmailAppPassword();

        boolean userConfigured = username != null && !username.trim().isEmpty() && !username.contains("yourgmail");
        boolean passConfigured = password != null && !password.trim().isEmpty() && !password.contains("your_app_password");

        System.out.println("----------------------------------------------------------");
        System.out.println("  GMAIL SMTP DIAGNOSTICS");
        System.out.println("----------------------------------------------------------");
        System.out.println(" SMTP Host: smtp.gmail.com (Port 587, STARTTLS)");
        System.out.println(" GMAIL_USERNAME: " + (userConfigured ? maskEmail(username) : "[MISSING in .env]"));
        System.out.println(" GMAIL_APP_PASSWORD: " + (passConfigured ? "(16-char App Password active)" : "[MISSING in .env]"));
        System.out.println("----------------------------------------------------------");
    }

    public static SmtpSendResult sendOtp(String recipient, String otp) {
        return sendRegistrationOtp(recipient, otp);
    }

    public static SmtpSendResult sendTestEmail(String recipient) {
        String subject = "SmartWay SMTP Connection Test";
        String htmlBody = "<p>Gmail SMTP test email sent successfully from SmartWay.</p>";
        return sendEmailInternal(recipient, subject, htmlBody);
    }

    /**
     * Sends an Email Verification OTP for Registration.
     */
    public static SmtpSendResult sendRegistrationOtp(String recipient, String otp) {
        String subject = "E-Commerce Email Verification OTP";
        String htmlBody = buildRegistrationHtml(otp);
        return sendEmailInternal(recipient, subject, htmlBody);
    }

    /**
     * Sends a Password Reset Verification Code for Forgot Password.
     */
    public static SmtpSendResult sendPasswordResetOtp(String recipient, String otp) {
        String subject = "Password Reset Verification Code";
        String htmlBody = buildPasswordResetHtml(otp);
        return sendEmailInternal(recipient, subject, htmlBody);
    }

    private static SmtpSendResult sendEmailInternal(String recipient, String subject, String htmlContent) {
        if (recipient == null || !OtpUtil.isValidEmail(recipient)) {
            return new SmtpSendResult(false, "Invalid recipient email address");
        }

        String username = EnvConfig.getGmailUsername();
        String password = EnvConfig.getGmailAppPassword();

        if (username == null || username.trim().isEmpty() || username.contains("yourgmail")) {
            String err = "GMAIL_USERNAME is not configured in .env.";
            LOGGER.severe(err);
            return new SmtpSendResult(false, "Gmail SMTP configuration error: GMAIL_USERNAME not set in .env");
        }

        if (password == null || password.trim().isEmpty() || password.contains("your_app_password")) {
            String err = "GMAIL_APP_PASSWORD is not configured in .env.";
            LOGGER.severe(err);
            return new SmtpSendResult(false, "Gmail SMTP configuration error: GMAIL_APP_PASSWORD not set in .env");
        }

        final String cleanUsername = username.trim();
        final String cleanPassword = password.replaceAll("\\s+", "");

        Properties props = new Properties();
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.protocols", "TLSv1.2 TLSv1.3");
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(cleanUsername, cleanPassword);
            }
        });

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(cleanUsername, "SmartWay Store"));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipient.trim().toLowerCase()));
            message.setSubject(subject);
            message.setContent(htmlContent, "text/html; charset=UTF-8");

            LOGGER.info("Sending email to " + maskEmail(recipient) + " with subject: " + subject + "...");
            Transport.send(message);

            LOGGER.info("Transport.send() successfully completed for " + maskEmail(recipient));
            return new SmtpSendResult(true, "Verification email sent successfully");

        } catch (AuthenticationFailedException e) {
            LOGGER.log(Level.SEVERE, "Gmail SMTP Authentication FAILED.", e);
            return new SmtpSendResult(false, "Gmail SMTP Authentication failed. Check GMAIL_USERNAME and App Password in .env");
        } catch (MessagingException e) {
            LOGGER.log(Level.SEVERE, "Gmail SMTP Transport failed: " + e.getMessage(), e);
            return new SmtpSendResult(false, "Unable to send verification email: " + e.getMessage());
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Unexpected error: " + e.getMessage(), e);
            return new SmtpSendResult(false, "Unable to send email");
        }
    }

    private static String buildRegistrationHtml(String otp) {
        return "<!DOCTYPE html>"
             + "<html>"
             + "<head><meta charset='UTF-8'></head>"
             + "<body style='font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background-color: #070A12; color: #F8FAFC; padding: 24px; margin: 0;'>"
             + "  <div style='max-width: 520px; margin: 0 auto; background: #0E1424; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 36px; box-shadow: 0 12px 36px rgba(0,0,0,0.5);'>"
             + "    <div style='text-align: center; margin-bottom: 24px;'>"
             + "      <h1 style='color: #FFFFFF; font-size: 24px; margin: 0; font-weight: 800;'>Smart<span style='color: #6366F1;'>Way</span></h1>"
             + "      <p style='color: #94A3B8; font-size: 14px; margin-top: 4px;'>Email Verification</p>"
             + "    </div>"
             + "    <p style='color: #E2E8F0; font-size: 15px; line-height: 1.6;'>Hello,</p>"
             + "    <p style='color: #CBD5E1; font-size: 15px; line-height: 1.6;'>Thank you for joining SmartWay. Please enter the following 6-digit one-time passcode to verify your email address:</p>"
             + "    <div style='text-align: center; margin: 28px 0;'>"
             + "      <div style='font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #818CF8; font-family: monospace; background: #141D33; padding: 16px 28px; border-radius: 12px; display: inline-block; border: 2px solid #6366F1; box-shadow: 0 0 25px rgba(99,102,241,0.3);'>"
             + otp
             + "      </div>"
             + "    </div>"
             + "    <p style='color: #10B981; font-weight: 700; font-size: 14px; text-align: center; margin: 0 0 18px;'>⏱️ Valid for 5 minutes. Single-use only.</p>"
             + "    <p style='color: #64748B; font-size: 13px; line-height: 1.6; margin: 0 0 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px;'>"
             + "      If you did not request this verification code, you can safely ignore this email. Never share your verification code with anyone."
             + "    </p>"
             + "    <div style='color: #94A3B8; font-size: 13px;'>"
             + "      Best regards,<br><strong style='color: #F8FAFC;'>SmartWay Team</strong>"
             + "    </div>"
             + "  </div>"
             + "</body>"
             + "</html>";
    }

    private static String buildPasswordResetHtml(String otp) {
        return "<!DOCTYPE html>"
             + "<html>"
             + "<head><meta charset='UTF-8'></head>"
             + "<body style='font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background-color: #070A12; color: #F8FAFC; padding: 24px; margin: 0;'>"
             + "  <div style='max-width: 520px; margin: 0 auto; background: #0E1424; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 36px; box-shadow: 0 12px 36px rgba(0,0,0,0.5);'>"
             + "    <div style='text-align: center; margin-bottom: 24px;'>"
             + "      <h1 style='color: #FFFFFF; font-size: 24px; margin: 0; font-weight: 800;'>Smart<span style='color: #EC4899;'>Way</span></h1>"
             + "      <p style='color: #F472B6; font-size: 14px; margin-top: 4px; font-weight: 700;'>Password Reset Request</p>"
             + "    </div>"
             + "    <p style='color: #E2E8F0; font-size: 15px; line-height: 1.6;'>Hello,</p>"
             + "    <p style='color: #CBD5E1; font-size: 15px; line-height: 1.6;'>We received a request to reset your SmartWay account password. Use the following 6-digit verification code to proceed:</p>"
             + "    <div style='text-align: center; margin: 28px 0;'>"
             + "      <div style='font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #F472B6; font-family: monospace; background: #141D33; padding: 16px 28px; border-radius: 12px; display: inline-block; border: 2px solid #EC4899; box-shadow: 0 0 25px rgba(236,72,153,0.3);'>"
             + otp
             + "      </div>"
             + "    </div>"
             + "    <p style='color: #F59E0B; font-weight: 700; font-size: 14px; text-align: center; margin: 0 0 18px;'>⏱️ Code expires in 5 minutes.</p>"
             + "    <p style='color: #64748B; font-size: 13px; line-height: 1.6; margin: 0 0 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 18px;'>"
             + "      If you did not request a password reset, please ignore this email. Your account remains secure."
             + "    </p>"
             + "    <div style='color: #94A3B8; font-size: 13px;'>"
             + "      Best regards,<br><strong style='color: #F8FAFC;'>SmartWay Security Team</strong>"
             + "    </div>"
             + "  </div>"
             + "</body>"
             + "</html>";
    }

    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "****";
        String[] parts = email.split("@");
        String name = parts[0];
        String domain = parts[1];
        String maskedName = (name.length() <= 2) ? name.charAt(0) + "*" : name.substring(0, 2) + "****";
        return maskedName + "@" + domain;
    }
}
