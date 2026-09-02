// Database Connection Pool for Vercel Serverless / MySQL
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306', 10),
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'ecommerce',
  user: process.env.MYSQL_USERNAME || process.env.MYSQL_USER || process.env.DB_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '081506',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 5000
});

async function query(sql, params) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (err) {
    console.warn('MySQL Query Warning:', err.message);
    throw err;
  }
}

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 as connected');
    return { connected: true, rows };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

module.exports = {
  pool,
  query,
  testConnection
};
