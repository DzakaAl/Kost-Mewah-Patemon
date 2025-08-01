const mysql = require("mysql2/promise");
require("dotenv").config();

async function createUlasanTable() {
  let connection;

  try {
    // Parse Heroku JawsDB URL
    const url = new URL(process.env.JAWSDB_URL);

    const dbConfig = {
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading slash
      port: url.port || 3306,
    };

    console.log("🔗 Connecting to production database...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to production database");

    // Create ulasan table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ulasan (
        No_Kamar int(10) NOT NULL,
        Email varchar(100) NOT NULL,
        Tanggal date NOT NULL DEFAULT (curdate()),
        Rating int(1) NOT NULL CHECK (Rating between 1 and 5),
        Ulasan varchar(1000) NOT NULL,
        PRIMARY KEY (Email),
        KEY fk_ulasan_kamar (No_Kamar),
        KEY fk_ulasan_user (Email),
        CONSTRAINT fk_ulasan_kamar FOREIGN KEY (No_Kamar) REFERENCES kamar (No_Kamar),
        CONSTRAINT fk_ulasan_user FOREIGN KEY (Email) REFERENCES user (Email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;

    console.log("📋 Creating ulasan table...");
    await connection.execute(createTableQuery);
    console.log("✅ Ulasan table created successfully");

    // Verify table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'ulasan'");
    if (tables.length > 0) {
      console.log("✅ Table verification: ulasan table exists");

      // Show table structure
      const [columns] = await connection.execute("DESCRIBE ulasan");
      console.log("📊 Table structure:");
      columns.forEach((col) => {
        console.log(
          `  - ${col.Field}: ${col.Type} ${
            col.Null === "NO" ? "NOT NULL" : "NULL"
          }`
        );
      });
    } else {
      console.log("❌ Table verification failed");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔐 Database connection closed");
    }
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createUlasanTable();
}

module.exports = createUlasanTable;
