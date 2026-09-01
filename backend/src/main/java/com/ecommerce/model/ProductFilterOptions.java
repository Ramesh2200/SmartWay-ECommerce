package com.ecommerce.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ProductFilterOptions {

    public static class CategoryOption {
        private Long id;
        private String name;
        private String slug;
        private int count;

        public CategoryOption(Long id, String name, String slug, int count) {
            this.id = id;
            this.name = name;
            this.slug = slug;
            this.count = count;
        }
        public Long getId() { return id; }
        public String getName() { return name; }
        public String getSlug() { return slug; }
        public int getCount() { return count; }
    }

    public static class SubcategoryOption {
        private Long id;
        private Long categoryId;
        private String categoryName;
        private String name;
        private int count;

        public SubcategoryOption(Long id, Long categoryId, String categoryName, String name, int count) {
            this.id = id;
            this.categoryId = categoryId;
            this.categoryName = categoryName;
            this.name = name;
            this.count = count;
        }
        public Long getId() { return id; }
        public Long getCategoryId() { return categoryId; }
        public String getCategoryName() { return categoryName; }
        public String getName() { return name; }
        public int getCount() { return count; }
    }

    public static class BrandOption {
        private Long id;
        private String name;
        private int count;

        public BrandOption(Long id, String name, int count) {
            this.id = id;
            this.name = name;
            this.count = count;
        }
        public Long getId() { return id; }
        public String getName() { return name; }
        public int getCount() { return count; }
    }

    public static class RatingOption {
        private double rating;
        private String label;
        private int count;

        public RatingOption(double rating, String label, int count) {
            this.rating = rating;
            this.label = label;
            this.count = count;
        }
        public double getRating() { return rating; }
        public String getLabel() { return label; }
        public int getCount() { return count; }
    }

    public static class DiscountOption {
        private int discount;
        private String label;
        private int count;

        public DiscountOption(int discount, String label, int count) {
            this.discount = discount;
            this.label = label;
            this.count = count;
        }
        public int getDiscount() { return discount; }
        public String getLabel() { return label; }
        public int getCount() { return count; }
    }

    public static class AvailabilityOption {
        private String key;
        private String label;
        private int count;

        public AvailabilityOption(String key, String label, int count) {
            this.key = key;
            this.label = label;
            this.count = count;
        }
        public String getKey() { return key; }
        public String getLabel() { return label; }
        public int getCount() { return count; }
    }

    public static class OfferOption {
        private String key;
        private String label;
        private int count;

        public OfferOption(String key, String label, int count) {
            this.key = key;
            this.label = label;
            this.count = count;
        }
        public String getKey() { return key; }
        public String getLabel() { return label; }
        public int getCount() { return count; }
    }

    private List<CategoryOption> categories = new ArrayList<>();
    private List<SubcategoryOption> subcategories = new ArrayList<>();
    private List<BrandOption> brands = new ArrayList<>();
    private Map<String, Double> priceRange = new HashMap<>();
    private List<RatingOption> ratings = new ArrayList<>();
    private List<DiscountOption> discounts = new ArrayList<>();
    private List<AvailabilityOption> availability = new ArrayList<>();
    private List<OfferOption> offers = new ArrayList<>();
    private int totalProducts;

    public List<CategoryOption> getCategories() { return categories; }
    public void setCategories(List<CategoryOption> categories) { this.categories = categories; }

    public List<SubcategoryOption> getSubcategories() { return subcategories; }
    public void setSubcategories(List<SubcategoryOption> subcategories) { this.subcategories = subcategories; }

    public List<BrandOption> getBrands() { return brands; }
    public void setBrands(List<BrandOption> brands) { this.brands = brands; }

    public Map<String, Double> getPriceRange() { return priceRange; }
    public void setPriceRange(Map<String, Double> priceRange) { this.priceRange = priceRange; }

    public List<RatingOption> getRatings() { return ratings; }
    public void setRatings(List<RatingOption> ratings) { this.ratings = ratings; }

    public List<DiscountOption> getDiscounts() { return discounts; }
    public void setDiscounts(List<DiscountOption> discounts) { this.discounts = discounts; }

    public List<AvailabilityOption> getAvailability() { return availability; }
    public void setAvailability(List<AvailabilityOption> availability) { this.availability = availability; }

    public List<OfferOption> getOffers() { return offers; }
    public void setOffers(List<OfferOption> offers) { this.offers = offers; }

    public int getTotalProducts() { return totalProducts; }
    public void setTotalProducts(int totalProducts) { this.totalProducts = totalProducts; }
}
