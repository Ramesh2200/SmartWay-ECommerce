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

@WebServlet("/api/auth/register")
public class RegisterServlet extends HttpServlet {

    private final UserService userService = new UserService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            JsonObject body = JsonUtil.parseRequestBody(request);
            if (body == null) {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Invalid request payload");
                return;
            }

            String fullName = body.has("fullName") ? body.get("fullName").getAsString() : null;
            String email = body.has("email") ? body.get("email").getAsString() : null;
            String password = body.has("password") ? body.get("password").getAsString() : null;

            if (fullName == null || email == null || password == null) {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "All fields (fullName, email, password) are required");
                return;
            }

            UserService.UserResult result = userService.register(fullName, email, password);

            if (result.isSuccess()) {
                JsonUtil.sendSuccessWithData(response, result.getMessage(), result.getUser());
            } else {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, result.getMessage());
            }
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Registration failed: " + e.getMessage());
        }
    }
}
