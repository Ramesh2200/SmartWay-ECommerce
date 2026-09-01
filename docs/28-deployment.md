# 28. Deployment Guide

- **Frontend**: `npm run build` generates optimized assets in `frontend/dist/`.
- **Backend**: `mvn clean package` builds executable WAR/JAR for Tomcat, Jetty, or AWS/Docker container deployment.
- **Database**: Run `backend/src/main/resources/schema_master.sql` in MySQL 8.0+.
