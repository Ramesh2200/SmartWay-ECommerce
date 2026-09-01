package com.ecommerce.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Utility for handling JSON requests and responses in Servlets.
 */
public class JsonUtil {

    private static final Gson GSON = new GsonBuilder()
            .setDateFormat("yyyy-MM-dd HH:mm:ss")
            .serializeNulls()
            .create();

    public static Gson getGson() {
        return GSON;
    }

    /**
     * Reads JSON from request body and parses to JsonObject.
     */
    public static JsonObject parseRequestBody(HttpServletRequest request) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        String body = sb.toString().trim();
        if (body.isEmpty()) {
            return new JsonObject();
        }
        return GSON.fromJson(body, JsonObject.class);
    }

    /**
     * Sends a successful JSON response with standard formatting.
     */
    public static void sendSuccess(HttpServletResponse response, String message) throws IOException {
        JsonObject json = new JsonObject();
        json.addProperty("success", true);
        json.addProperty("message", message);
        sendResponse(response, HttpServletResponse.SC_OK, json);
    }

    /**
     * Sends a successful JSON response with data payload.
     */
    public static void sendSuccessWithData(HttpServletResponse response, String message, Object data) throws IOException {
        JsonObject json = new JsonObject();
        json.addProperty("success", true);
        json.addProperty("message", message);
        json.add("data", GSON.toJsonTree(data));
        sendResponse(response, HttpServletResponse.SC_OK, json);
    }

    /**
     * Sends an error JSON response with custom HTTP status code.
     */
    public static void sendError(HttpServletResponse response, int statusCode, String message) throws IOException {
        JsonObject json = new JsonObject();
        json.addProperty("success", false);
        json.addProperty("message", message);
        sendResponse(response, statusCode, json);
    }

    /**
     * Writes JSON output to response with proper headers.
     */
    public static void sendResponse(HttpServletResponse response, int statusCode, Object data) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(statusCode);
        try (PrintWriter writer = response.getWriter()) {
            writer.write(GSON.toJson(data));
            writer.flush();
        }
    }
}
