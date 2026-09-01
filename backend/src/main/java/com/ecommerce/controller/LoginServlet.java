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

@WebServlet("/api/auth/login")
public class LoginServlet extends HttpServlet {

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

            String email = body.has("email") ? body.get("email").getAsString() :
                    (body.has("identifier") ? body.get("identifier").getAsString() : null);

            String password = body.has("password") ? body.get("password").getAsString() : null;

            if (email == null || password == null) {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Email and Password are required");
                return;
            }

            UserService.UserResult result = userService.login(email, password);

            if (result.isSuccess()) {
                JsonUtil.sendSuccessWithData(response, result.getMessage(), result.getUser());
            } else {
                JsonUtil.sendError(response, HttpServletResponse.SC_UNAUTHORIZED, result.getMessage());
            }
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Login failed: " + e.getMessage());
        }
    }
}
