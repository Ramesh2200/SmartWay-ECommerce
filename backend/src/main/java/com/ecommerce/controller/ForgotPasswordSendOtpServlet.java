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

@WebServlet("/api/auth/forgot-password/send-otp")
public class ForgotPasswordSendOtpServlet extends HttpServlet {

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
            OtpService.OtpResult result = otpService.sendForgotPasswordOtp(email);

            if (result.isSuccess()) {
                JsonObject data = new JsonObject();
                data.addProperty("email", email);
                data.addProperty("cooldownSeconds", 60);
                JsonUtil.sendSuccessWithData(response, result.getMessage(), data);
            } else {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, result.getMessage());
            }
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to send reset code: " + e.getMessage());
        }
    }
}
