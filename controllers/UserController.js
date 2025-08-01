const User = require("../models/User");

class UserController {
  // Get all users (Admin only)
  static async getAllUsers(req, res) {
    try {
      const users = await User.getAllUsers();

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete user's own account (User)
  static async deleteMyAccount(req, res) {
    try {
      const { email } = req.user;
      
      // Check if user has active reservations
      const Reservasi = require("../models/Reservasi");
      const userReservations = await Reservasi.getByUser(email);
      
      const activeReservations = userReservations.filter(
        reservation => reservation.Status === "Diterima"
      );
      
      if (activeReservations.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete account. You have active reservations. Please contact admin to resolve your reservations first."
        });
      }

      // Delete user account
      const result = await User.deleteUser(email);

      if (result.success) {
        res.json({
          success: true,
          message: "Account deleted successfully"
        });
      } else {
        res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
    } catch (error) {
      console.error("Delete my account error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get user by email (Admin only)
  static async getUserByEmail(req, res) {
    try {
      const { email } = req.params;
      const user = await User.findByEmail(email);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Remove password from response
      delete user.Password;

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Get user by email error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Create new user (Admin only)
  static async createUser(req, res) {
    try {
      const { Nama, Email, Password, No_telp, Alamat, Role } = req.body;

      if (!Nama || !Email || !Password || !No_telp || !Alamat) {
        return res.status(400).json({
          success: false,
          message: "Semua field harus diisi",
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(Email)) {
        return res.status(400).json({
          success: false,
          message: "Format email tidak valid",
        });
      }

      // Validate phone number format (Indonesian)
      const phoneRegex = /^(08|62)\d{8,13}$/;
      if (!phoneRegex.test(No_telp)) {
        return res.status(400).json({
          success: false,
          message: "Format nomor telepon tidak valid",
        });
      }

      const result = await User.createByAdmin({
        Nama,
        Email,
        Password,
        No_telp,
        Alamat,
        Role: Role || "penyewa",
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update user (Admin only)
  static async updateUser(req, res) {
    try {
      const { email } = req.params;
      const { Nama, No_telp, Alamat, Role } = req.body;

      if (!Nama || !No_telp || !Alamat) {
        return res.status(400).json({
          success: false,
          message: "Nama, nomor telepon, dan alamat harus diisi",
        });
      }

      // Validate phone number format (Indonesian)
      const phoneRegex = /^(08|62)\d{8,13}$/;
      if (!phoneRegex.test(No_telp)) {
        return res.status(400).json({
          success: false,
          message: "Format nomor telepon tidak valid",
        });
      }

      const result = await User.updateUser(email, {
        Nama,
        No_telp,
        Alamat,
        Role: Role || "penyewa",
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete user (Admin only)
  static async deleteUser(req, res) {
    try {
      const { email } = req.params;

      // Prevent admin from deleting themselves
      const currentUserEmail = req.user?.Email || req.user?.email;
      if (email === currentUserEmail) {
        return res.status(400).json({
          success: false,
          message: "Tidak dapat menghapus akun sendiri",
        });
      }

      const result = await User.deleteUser(email);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = UserController;
