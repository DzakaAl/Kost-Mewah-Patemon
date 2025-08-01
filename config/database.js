const mysql = require("mysql2/promise");
require("dotenv").config();

// Parse Heroku JawsDB URL if available
let dbConfig;
if (process.env.JAWSDB_URL) {
  // Production (Heroku) configuration
  const url = new URL(process.env.JAWSDB_URL);
  dbConfig = {
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading slash
    port: url.port || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
  };
} else {
  // Local development configuration
  dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "kost_patemon",
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
}

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");
    console.log(
      `📍 Connected to: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`
    );
    console.log(`👤 User: ${dbConfig.user}`);
    connection.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("📋 Config:", {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
    });
  }
}

module.exports = {
  pool,
  testConnection,
};
