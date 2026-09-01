# 07. Database Schema Reference

The complete relational schema is defined in `backend/src/main/resources/schema_master.sql` and maintained dynamically by `DatabaseSeeder.java`.

### Tables Breakdown
1. **`users`**: Stores customer account credentials, salted bcrypt password hashes, and email verification flags.
2. **`categories`**: Master product categories (Electronics, Fashion, Home & Living, Beauty & Care, Sports & Fitness, Automotive, Toys & Games, Books & Stationery, Accessories).
3. **`subcategories`**: Refined categorization under each parent category.
4. **`brands`**: Catalog brands (Apple, Samsung, Sony, Dell, Nike, Adidas, etc.).
5. **`products`**: Product records containing title, price, original price, discount, rating, review count, stock quantity, and category foreign keys.
6. **`product_images`**: Image gallery URLs associated with products.
7. **`orders`**: Order master records with unique `order_number`, foreign-keyed `user_id`, order totals, payment status, and shipping address.
8. **`order_items`**: Immutable snapshot records of purchased products, quantities, unit prices, and subtotals.
