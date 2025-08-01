const Ulasan = require("../models/Ulasan");
const { validationResult } = require("express-validator");

class UlasanController {
  // Get all ulasan
  static async getAllUlasan(req, res) {
    try {
      const ulasan = await Ulasan.getAll();
      
      // Format data untuk frontend
      const formattedUlasan = ulasan.map(review => ({
        email: review.Email,
        userName: review.User_Name || "Pengguna",
        userPhoto: review.User_Photo,
        rating: review.Rating,
        reviewText: review.Review_Text,
        noKamar: review.No_Kamar,
        date: review.Tanggal_Ulasan,
        formattedDate: new Date(review.Tanggal_Ulasan).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }));

      res.json({
        success: true,
        message: "Ulasan berhasil diambil",
        data: formattedUlasan
      });
    } catch (error) {
      console.error("Error getting ulasan:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data ulasan",
        error: error.message
      });
    }
  }

  // Get ulasan by user email
  static async getUlasanByUser(req, res) {
    try {
      const { email } = req.user;
      const ulasan = await Ulasan.getByEmail(email);
      
      const formattedUlasan = ulasan.map(review => ({
        email: review.Email,
        userName: review.User_Name || "Pengguna",
        userPhoto: review.User_Photo,
        rating: review.Rating,
        reviewText: review.Review_Text,
        noKamar: review.No_Kamar,
        date: review.Tanggal_Ulasan,
        formattedDate: new Date(review.Tanggal_Ulasan).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }));

      res.json({
        success: true,
        message: "Ulasan pengguna berhasil diambil",
        data: formattedUlasan
      });
    } catch (error) {
      console.error("Error getting user ulasan:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil ulasan pengguna",
        error: error.message
      });
    }
  }

  // Create new ulasan
  static async createUlasan(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array()
        });
      }

      const { email } = req.user;
      const { rating, ulasan } = req.body;

      // Validate rating
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating harus antara 1-5"
        });
      }

      // Validate ulasan text
      if (!ulasan || ulasan.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: "Ulasan minimal 10 karakter"
        });
      }

      const newUlasan = await Ulasan.create({
        email,
        rating: parseInt(rating),
        ulasan: ulasan.trim()
      });

      res.status(201).json({
        success: true,
        message: "Ulasan berhasil ditambahkan",
        data: newUlasan
      });
    } catch (error) {
      console.error("Error creating ulasan:", error);
      
      if (error.message === "Anda sudah memberikan ulasan sebelumnya") {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: "Gagal menambahkan ulasan",
        error: error.message
      });
    }
  }

  // Update ulasan
  static async updateUlasan(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { rating, ulasan } = req.body;

      // Validate rating
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating harus antara 1-5"
        });
      }

      // Validate ulasan text
      if (!ulasan || ulasan.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: "Ulasan minimal 10 karakter"
        });
      }

      await Ulasan.update(id, {
        rating: parseInt(rating),
        ulasan: ulasan.trim()
      });

      res.json({
        success: true,
        message: "Ulasan berhasil diupdate"
      });
    } catch (error) {
      console.error("Error updating ulasan:", error);
      
      if (error.message === "Ulasan tidak ditemukan") {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: "Gagal mengupdate ulasan",
        error: error.message
      });
    }
  }

  // Delete ulasan
  static async deleteUlasan(req, res) {
    try {
      const { id } = req.params;
      
      await Ulasan.delete(id);

      res.json({
        success: true,
        message: "Ulasan berhasil dihapus"
      });
    } catch (error) {
      console.error("Error deleting ulasan:", error);
      
      if (error.message === "Ulasan tidak ditemukan") {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: "Gagal menghapus ulasan",
        error: error.message
      });
    }
  }

  // Get ulasan statistics
  static async getUlasanStats(req, res) {
    try {
      const stats = await Ulasan.getStats();
      
      res.json({
        success: true,
        message: "Statistik ulasan berhasil diambil",
        data: {
          totalReviews: stats.total_reviews,
          averageRating: parseFloat(stats.average_rating || 0).toFixed(1),
          ratingDistribution: {
            fiveStar: stats.five_star,
            fourStar: stats.four_star,
            threeStar: stats.three_star,
            twoStar: stats.two_star,
            oneStar: stats.one_star
          }
        }
      });
    } catch (error) {
      console.error("Error getting ulasan stats:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil statistik ulasan",
        error: error.message
      });
    }
  }
}

module.exports = UlasanController;
