package com.ecommerce.controller;

import com.ecommerce.service.GmailEmailService;
import com.ecommerce.util.JsonUtil;
import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/api/auth/test-smtp")
public class TestSmtpServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            JsonObject body = JsonUtil.parseRequestBody(request);
            if (body == null || !body.has("email")) {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, "Email is required to send SMTP test");
                return;
            }

            String recipient = body.get("email").getAsString();
            GmailEmailService.SmtpSendResult result = GmailEmailService.sendTestEmail(recipient);

            if (result.isSuccess()) {
                JsonUtil.sendSuccess(response, result.getMessage());
            } else {
                JsonUtil.sendError(response, HttpServletResponse.SC_BAD_REQUEST, result.getMessage());
            }
        } catch (Exception e) {
            JsonUtil.sendError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "SMTP Test Error: " + e.getMessage());
        }
    }
}
