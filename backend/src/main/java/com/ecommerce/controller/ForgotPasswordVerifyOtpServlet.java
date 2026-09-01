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

@WebServlet("/api/auth/forgot-password/verify-otp")
public class ForgotPasswordVerifyOtpServlet extends HttpServlet {

    private final OtpService otpService = new OtpService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            JsonObject body = JsonUtil.parseRequestBody(request);
            if (body == null || !body.has("email") || !body.has("otp")) {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Email and OTP are required");
                return;
            }

            String email = body.get("email").getAsString();
            String otp = body.get("otp").getAsString();

            OtpService.OtpResult result = otpService.verifyOtp(email, otp);

            if (result.isSuccess()) {
                JsonObject data = new JsonObject();
                data.addProperty("email", email);
                data.addProperty("verified", true);
                JsonUtil.sendSuccessWithData(response, "Email verified successfully. You can now reset your password.", data);
            } else {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, result.getMessage());
            }
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Verification failed: " + e.getMessage());
        }
    }
}
