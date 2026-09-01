# 23. Security Architecture

1. **SQL Injection Prevention**: 100% parameterization using `PreparedStatement` on all JDBC operations.
2. **Password Safety**: Salted bcrypt password hashing with jBCrypt.
3. **Customer Isolation**: Order retrieval scoped strictly to `authenticatedUserId`.
4. **Zero Technical Jargon**: No backend, database, or tech stack details visible on customer pages.
