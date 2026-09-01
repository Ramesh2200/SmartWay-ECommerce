package com.ecommerce.controller;

import com.ecommerce.dao.ProductDao;
import com.ecommerce.model.ProductFilterOptions;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

public class FilterOptionsServlet extends HttpServlet {

    private final ProductDao productDao = new ProductDao();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        String category = req.getParameter("category");

        try (PrintWriter out = resp.getWriter()) {
            ProductFilterOptions options = productDao.getFilterOptions(category);
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", options);
            out.print(gson.toJson(result));
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to retrieve filter options: " + e.getMessage());
            resp.getWriter().print(gson.toJson(error));
        }
    }
}
