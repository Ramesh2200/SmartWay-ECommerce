package com.ecommerce.controller;

import com.ecommerce.service.OtpService;
import com.ecommerce.util.JsonUtil;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet(urlPatterns = {"/api/auth/send-email-otp", "/api/auth/send-otp"})
public class SendEmailOtpServlet extends HttpServlet {

    private final OtpService otpService = new OtpService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            JsonObject body = JsonUtil.parseRequestBody(request);
            if (body == null || !body.has("email")) {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Email address is required");
                return;
            }

            String email = body.get("email").getAsString();
            OtpService.OtpResult result = otpService.sendOtp(email);

            if (result.isSuccess()) {
                JsonUtil.sendSuccess(response, result.getMessage());
            } else if (result.isAlreadyAuthenticated()) {
                JsonObject json = new JsonObject();
                json.addProperty("success", false);
                json.addProperty("alreadyAuthenticated", true);
                json.addProperty("message", "This email is already authenticated. Please login.");
                JsonUtil.sendResponse(response, HttpServletResponse.SC_OK, json);
            } else {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, result.getMessage());
            }
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to process OTP request: " + e.getMessage());
        }
    }
}
