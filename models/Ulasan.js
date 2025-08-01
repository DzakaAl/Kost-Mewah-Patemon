const { pool } = require("../config/database");

class Ulasan {
  // Get all ulasan dengan informasi user
  static async getAll() {
    try {
      const query = `
        SELECT 
          u.Email,
          u.Rating,
          u.Ulasan as Review_Text,
          u.Tanggal as Tanggal_Ulasan,
          u.No_Kamar,
          usr.Nama as User_Name,
          usr.Foto as User_Photo
        FROM ulasan u
        LEFT JOIN user usr ON u.Email = usr.Email
        ORDER BY u.Tanggal DESC
      `;
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error("Error fetching ulasan:", error);
      throw error;
    }
  }

  // Get ulasan by email
  static async getByEmail(email) {
    try {
      const query = `
        SELECT 
          u.Email,
          u.Rating,
          u.Ulasan as Review_Text,
          u.Tanggal as Tanggal_Ulasan,
          u.No_Kamar,
          usr.Nama as User_Name,
          usr.Foto as User_Photo
        FROM ulasan u
        LEFT JOIN user usr ON u.Email = usr.Email
        WHERE u.Email = ?
        ORDER BY u.Tanggal DESC
      `;
      const [rows] = await pool.execute(query, [email]);
      return rows;
    } catch (error) {
      console.error("Error fetching ulasan by email:", error);
      throw error;
    }
  }

  // Create new ulasan
  static async create(data) {
    try {
      const { email, rating, ulasan } = data;
      
      // Check if user already has a review
      const existingQuery = "SELECT Email FROM ulasan WHERE Email = ?";
      const [existing] = await pool.execute(existingQuery, [email]);
      
      if (existing.length > 0) {
        throw new Error("Anda sudah memberikan ulasan sebelumnya");
      }

      const query = `
        INSERT INTO ulasan (Email, Rating, Ulasan, No_Kamar, Tanggal)
        VALUES (?, ?, ?, 1, CURDATE())
      `;
      const [result] = await pool.execute(query, [email, rating, ulasan]);
      
      return {
        Email: email,
        Rating: rating,
        Ulasan: ulasan,
        No_Kamar: 1,
        Tanggal: new Date()
      };
    } catch (error) {
      console.error("Error creating ulasan:", error);
      throw error;
    }
  }

  // Update ulasan
  static async update(email, data) {
    try {
      const { rating, ulasan } = data;
      const query = `
        UPDATE ulasan 
        SET Rating = ?, Ulasan = ?, Tanggal = CURDATE()
        WHERE Email = ?
      `;
      const [result] = await pool.execute(query, [rating, ulasan, email]);
      
      if (result.affectedRows === 0) {
        throw new Error("Ulasan tidak ditemukan");
      }
      
      return result;
    } catch (error) {
      console.error("Error updating ulasan:", error);
      throw error;
    }
  }

  // Delete ulasan
  static async delete(email) {
    try {
      const query = "DELETE FROM ulasan WHERE Email = ?";
      const [result] = await pool.execute(query, [email]);
      
      if (result.affectedRows === 0) {
        throw new Error("Ulasan tidak ditemukan");
      }
      
      return result;
    } catch (error) {
      console.error("Error deleting ulasan:", error);
      throw error;
    }
  }

  // Get ulasan statistics
  static async getStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_reviews,
          AVG(Rating) as average_rating,
          COUNT(CASE WHEN Rating = 5 THEN 1 END) as five_star,
          COUNT(CASE WHEN Rating = 4 THEN 1 END) as four_star,
          COUNT(CASE WHEN Rating = 3 THEN 1 END) as three_star,
          COUNT(CASE WHEN Rating = 2 THEN 1 END) as two_star,
          COUNT(CASE WHEN Rating = 1 THEN 1 END) as one_star
        FROM ulasan
      `;
      const [rows] = await pool.execute(query);
      return rows[0];
    } catch (error) {
      console.error("Error fetching ulasan stats:", error);
      throw error;
    }
  }
}

module.exports = Ulasan;
