package com.ecommerce.controller;

import com.ecommerce.dao.ProductDao;
import com.ecommerce.model.Product;
import com.ecommerce.model.ProductFilterOptions;
import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ProductServlet extends HttpServlet {

    private final ProductDao productDao = new ProductDao();
    private final Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");

        String pathInfo = req.getPathInfo();
        PrintWriter out = resp.getWriter();

        try {
            // Check if path is /filter-options
            if (pathInfo != null && pathInfo.equalsIgnoreCase("/filter-options")) {
                String category = req.getParameter("category");
                ProductFilterOptions options = productDao.getFilterOptions(category);
                Map<String, Object> res = new HashMap<>();
                res.put("success", true);
                res.put("data", options);
                out.print(gson.toJson(res));
                return;
            }

            // Check if requesting single product details by ID, e.g. /api/products/5
            if (pathInfo != null && pathInfo.length() > 1) {
                String idStr = pathInfo.substring(1).trim();
                try {
                    long id = Long.parseLong(idStr);
                    Product product = productDao.getProductById(id);
                    if (product != null) {
                        Map<String, Object> res = new HashMap<>();
                        res.put("success", true);
                        res.put("data", product);
                        out.print(gson.toJson(res));
                    } else {
                        resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                        Map<String, Object> res = new HashMap<>();
                        res.put("success", false);
                        res.put("message", "Product not found with id: " + id);
                        out.print(gson.toJson(res));
                    }
                    return;
                } catch (NumberFormatException ignored) {
                    // Not a numeric ID, fall through to query parameters
                }
            }

            // Extract filter query parameters
            String search = req.getParameter("search");
            if (search == null) search = req.getParameter("q");

            String category = req.getParameter("category");
            String subcategory = req.getParameter("subcategory");
            String brand = req.getParameter("brand");

            BigDecimal minPrice = null;
            if (req.getParameter("minPrice") != null && !req.getParameter("minPrice").trim().isEmpty()) {
                try { minPrice = new BigDecimal(req.getParameter("minPrice").trim()); } catch (Exception ignored) {}
            }

            BigDecimal maxPrice = null;
            if (req.getParameter("maxPrice") != null && !req.getParameter("maxPrice").trim().isEmpty()) {
                try { maxPrice = new BigDecimal(req.getParameter("maxPrice").trim()); } catch (Exception ignored) {}
            }

            Double rating = null;
            if (req.getParameter("rating") != null && !req.getParameter("rating").trim().isEmpty()) {
                try { rating = Double.parseDouble(req.getParameter("rating").trim()); } catch (Exception ignored) {}
            }

            Integer discount = null;
            if (req.getParameter("discount") != null && !req.getParameter("discount").trim().isEmpty()) {
                try { discount = Integer.parseInt(req.getParameter("discount").trim()); } catch (Exception ignored) {}
            }

            String availability = req.getParameter("availability");
            String offer = req.getParameter("offer");
            String sort = req.getParameter("sort");

            Integer page = null;
            if (req.getParameter("page") != null) {
                try { page = Integer.parseInt(req.getParameter("page").trim()); } catch (Exception ignored) {}
            }

            Integer limit = null;
            if (req.getParameter("limit") != null) {
                try { limit = Integer.parseInt(req.getParameter("limit").trim()); } catch (Exception ignored) {}
            }

            List<Product> products = productDao.getProducts(
                    search, category, subcategory, brand, minPrice, maxPrice,
                    rating, discount, availability, offer, sort, page, limit
            );

            Map<String, Object> res = new HashMap<>();
            res.put("success", true);
            res.put("total", products.size());
            res.put("data", products);
            out.print(gson.toJson(res));

        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error loading products: " + e.getMessage());
            out.print(gson.toJson(error));
        }
    }
}
