const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupHerokuDatabase() {
  console.log('🔧 Setting up Heroku Database...');
  
  // Parse JawsDB URL
  const jawsdbUrl = process.env.JAWSDB_URL;
  if (!jawsdbUrl) {
    console.error('❌ JAWSDB_URL not found. Make sure JawsDB addon is installed.');
    return;
  }

  const url = new URL(jawsdbUrl);
  const connection = await mysql.createConnection({
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    port: url.port || 3306
  });

  try {
    console.log('✅ Connected to Heroku MySQL database');
    
    // Read and execute SQL file
    const fs = require('fs');
    const path = require('path');
    const sqlFile = path.join(__dirname, 'kost_patemon.sql');
    
    if (fs.existsSync(sqlFile)) {
      const sql = fs.readFileSync(sqlFile, 'utf8');
      
      // Split SQL into individual statements
      const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
      
      console.log(`📋 Executing ${statements.length} SQL statements...`);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement) {
          try {
            await connection.execute(statement);
            console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
          } catch (error) {
            console.log(`⚠️  Statement ${i + 1} skipped (may already exist):`, error.message);
          }
        }
      }
      
      console.log('🎉 Database setup completed!');
    } else {
      console.log('⚠️  SQL file not found. Creating basic tables...');
      
      // Create basic tables
      const basicTables = [
        `CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          nama_lengkap VARCHAR(100) NOT NULL,
          nomor_hp VARCHAR(20),
          role ENUM('admin', 'user') DEFAULT 'user',
          profile_image VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS kamar (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nomor_kamar VARCHAR(10) UNIQUE NOT NULL,
          harga_per_bulan DECIMAL(10,2) NOT NULL,
          status ENUM('tersedia', 'terisi', 'maintenance') DEFAULT 'tersedia',
          deskripsi TEXT,
          fasilitas JSON,
          gambar VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`,
        
        `INSERT IGNORE INTO users (username, email, password, nama_lengkap, role) 
         VALUES ('admin', 'admin@kostpatemon.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin')`
      ];
      
      for (const table of basicTables) {
        await connection.execute(table);
      }
      
      console.log('✅ Basic tables created');
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  setupHerokuDatabase().catch(console.error);
}

module.exports = setupHerokuDatabase;
