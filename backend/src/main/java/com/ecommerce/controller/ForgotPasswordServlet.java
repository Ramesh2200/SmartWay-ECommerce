package com.ecommerce.controller;

import com.ecommerce.service.UserService;
import com.ecommerce.util.JsonUtil;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/api/auth/reset-password")
public class ForgotPasswordServlet extends HttpServlet {

    private final UserService userService = new UserService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            JsonObject body = JsonUtil.parseRequestBody(request);
            if (body == null || !body.has("email") || !body.has("newPassword")) {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Email and newPassword are required");
                return;
            }

            String email = body.get("email").getAsString();
            String newPassword = body.get("newPassword").getAsString();

            UserService.UserResult result = userService.resetPassword(email, newPassword);

            if (result.isSuccess()) {
                JsonUtil.sendSuccess(response, result.getMessage());
            } else {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, result.getMessage());
            }
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Password reset failed: " + e.getMessage());
        }
    }
}
