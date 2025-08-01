const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  // Create new user (Registration)
  static async create(userData) {
    const { Nama, Email, Password, No_telp, Alamat } = userData;

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(Password, 10);

      const query = `
                INSERT INTO user (Nama, No_telp, Alamat, Email, Password, Role) 
                VALUES (?, ?, ?, ?, ?, 'penyewa')
            `;

      const [result] = await pool.execute(query, [
        Nama,
        No_telp,
        Alamat,
        Email,
        hashedPassword,
      ]);

      return {
        success: true,
        message: "User created successfully",
        userId: result.insertId,
      };
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return {
          success: false,
          message: "Email already exists",
        };
      }
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const query = "SELECT * FROM user WHERE Email = ?";
      const [rows] = await pool.execute(query, [email]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all users (Admin only)
  static async getAllUsers() {
    try {
      const query = "SELECT Nama, Email, No_telp, Alamat, Role, Foto FROM user ORDER BY Nama";
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get user profile (without password)
  static async getProfile(email) {
    try {
      const query =
        "SELECT Nama, No_telp, Alamat, Email, Foto, Role FROM user WHERE Email = ?";
      const [rows] = await pool.execute(query, [email]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(email, updateData) {
    try {
      const { Nama, No_telp, Alamat, Foto } = updateData;

      // Build dynamic query based on what fields are being updated
      let setClause = [];
      let queryParams = [];

      if (Nama !== undefined) {
        setClause.push("Nama = ?");
        queryParams.push(Nama);
      }

      if (No_telp !== undefined) {
        setClause.push("No_telp = ?");
        queryParams.push(No_telp);
      }

      if (Alamat !== undefined) {
        setClause.push("Alamat = ?");
        queryParams.push(Alamat);
      }

      if (Foto !== undefined) {
        setClause.push("Foto = ?");
        queryParams.push(Foto);
      }

      if (setClause.length === 0) {
        return {
          success: false,
          message: "No valid fields to update",
        };
      }

      const query = `UPDATE user SET ${setClause.join(", ")} WHERE Email = ?`;
      queryParams.push(email);

      const [result] = await pool.execute(query, queryParams);

      if (result.affectedRows > 0) {
        // Return updated user data
        const updatedUser = await this.findByEmail(email);
        return {
          success: true,
          message: "Profile updated successfully",
          data: {
            Nama: updatedUser.Nama,
            Email: updatedUser.Email,
            No_telp: updatedUser.No_telp,
            Alamat: updatedUser.Alamat,
            Foto: updatedUser.Foto,
            Role: updatedUser.Role,
          },
        };
      } else {
        return {
          success: false,
          message: "User not found",
        };
      }
    } catch (error) {
      throw error;
    }
  }

  // Change user password
  static async changePassword(email, currentPassword, newPassword) {
    try {
      // Get current user data
      const user = await this.findByEmail(email);
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await this.verifyPassword(
        currentPassword,
        user.Password
      );
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          message: "Password lama tidak benar",
        };
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password in database
      const query = "UPDATE user SET Password = ? WHERE Email = ?";
      const [result] = await pool.execute(query, [hashedNewPassword, email]);

      if (result.affectedRows > 0) {
        return {
          success: true,
          message: "Password berhasil diubah",
        };
      } else {
        return {
          success: false,
          message: "Gagal mengubah password",
        };
      }
    } catch (error) {
      throw error;
    }
  }

  // Get all reservations with user data for admin
  static async getAllReservationsWithUserData(filters = {}) {
    try {
      let query = `
        SELECT 
          r.ID_Reservasi,
          r.No_Kamar,
          r.Email,
          r.Tanggal_Reservasi,
          r.Status,
          u.Nama,
          u.No_telp,
          u.Alamat,
          u.Role,
          u.Foto,
          k.Nama_Kamar,
          k.Letak,
          k.Ketersediaan
        FROM reservasi r
        LEFT JOIN user u ON r.Email = u.Email
        LEFT JOIN kamar k ON r.No_Kamar = k.No_Kamar
        WHERE 1=1
      `;

      let queryParams = [];

      // Apply filters
      if (filters.status && filters.status !== "") {
        query += " AND r.Status = ?";
        queryParams.push(filters.status);
      }

      if (filters.kamar && filters.kamar !== "") {
        query += " AND r.No_Kamar = ?";
        queryParams.push(filters.kamar);
      }

      if (filters.periode && filters.periode !== "") {
        query += ' AND DATE_FORMAT(r.Tanggal_Reservasi, "%Y-%m") = ?';
        queryParams.push(filters.periode);
      }

      query += " ORDER BY r.Tanggal_Reservasi DESC, u.Nama ASC";

      const [rows] = await pool.execute(query, queryParams);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get filter options for admin interface
  static async getFilterOptions() {
    try {
      const [statusRows] = await pool.execute(`
        SELECT DISTINCT Status 
        FROM reservasi 
        WHERE Status IS NOT NULL 
        ORDER BY Status
      `);

      const [kamarRows] = await pool.execute(`
        SELECT DISTINCT No_Kamar 
        FROM kamar 
        ORDER BY No_Kamar
      `);

      const [periodeRows] = await pool.execute(`
        SELECT DISTINCT DATE_FORMAT(Tanggal_Reservasi, "%Y-%m") as periode
        FROM reservasi 
        WHERE Tanggal_Reservasi IS NOT NULL
        ORDER BY periode DESC
      `);

      return {
        statuses: statusRows.map((row) => row.Status),
        kamars: kamarRows.map((row) => row.No_Kamar),
        periodes: periodeRows.map((row) => row.periode),
      };
    } catch (error) {
      throw error;
    }
  }

  // Update reservation status
  static async updateReservationStatus(
    reservasiId,
    newStatus,
    keterangan = null
  ) {
    try {
      let query = "UPDATE reservasi SET Status = ?";
      let queryParams = [newStatus];

      query += " WHERE ID_Reservasi = ?";
      queryParams.push(reservasiId);

      const [result] = await pool.execute(query, queryParams);

      if (result.affectedRows > 0) {
        return {
          success: true,
          message: "Status reservasi berhasil diupdate",
        };
      } else {
        return {
          success: false,
          message: "Reservasi tidak ditemukan",
        };
      }
    } catch (error) {
      throw error;
    }
  }

  // Get all users (for admin interface)
  static async getAll() {
    try {
      const query = `
        SELECT Nama, Email, No_telp, Alamat, Role, Foto
        FROM user 
        ORDER BY Nama ASC
      `;
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get dashboard statistics
  static async getDashboardStatistics() {
    try {
      // Get total kamar count
      const [kamarResult] = await pool.execute(
        "SELECT COUNT(*) as total_kamar FROM kamar"
      );
      const totalKamar = kamarResult[0].total_kamar;

      // Get active users count (penyewa role only)
      const [userResult] = await pool.execute(
        "SELECT COUNT(*) as total_users FROM user WHERE Role = 'penyewa'"
      );
      const totalUsers = userResult[0].total_users;

      // Get monthly payment total based on actual payments with 'Diterima' status for current month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const [paymentResult] = await pool.execute(
        `
        SELECT COALESCE(SUM(p.Jumlah), 0) as monthly_payment, COUNT(*) as paid_count
        FROM pembayaran p 
        WHERE p.Status = 'Diterima' 
        AND DATE_FORMAT(p.Tanggal_Bayar, '%Y-%m') = ?
      `,
        [currentMonth]
      );

      const monthlyPayment = paymentResult[0].monthly_payment || 0;
      const paidUsers = paymentResult[0].paid_count || 0;

      // Calculate occupancy percentage
      const occupancyPercentage =
        totalKamar > 0 ? Math.round((totalUsers / totalKamar) * 100) : 0;

      return {
        totalKamar,
        totalUsers,
        monthlyPayment,
        occupancyPercentage,
        paidUsers,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all payments for admin interface (adapted for current database schema)
  static async getAllPaymentsForAdmin(filters = {}) {
    try {
      let query = `
        SELECT 
          p.ID_Pembayaran as id,
          u.Nama as nama,
          CONCAT('Kamar ', r.No_Kamar) as kamar,
          r.No_Kamar as no_kamar,
          COALESCE(DATE_FORMAT(p.Tanggal_Bayar, '%m'), '07') as bulan,
          COALESCE(DATE_FORMAT(p.Tanggal_Bayar, '%Y'), '2025') as tahun,
          p.Jumlah as jumlah,
          p.Tanggal_Bayar as tanggal_bayar,
          CASE 
            WHEN p.Status = 'Lunas' THEN 'Diterima'
            WHEN p.Status = 'Belum Bayar' THEN 'Menunggu'
            WHEN p.Status = 'Terlambat' THEN 'Ditolak'
            ELSE p.Status
          END as status,
          NULL as bukti_pembayaran,
          u.Email as email,
          u.No_telp as no_telp
        FROM pembayaran p
        INNER JOIN reservasi r ON p.ID_Reservasi = r.ID_Reservasi
        INNER JOIN user u ON r.Email = u.Email
        WHERE 1=1
      `;

      const params = [];

      // Apply filters
      if (filters.status && filters.status !== "") {
        const dbStatus =
          filters.status === "Diterima"
            ? "Lunas"
            : filters.status === "Menunggu"
            ? "Belum Bayar"
            : filters.status === "Ditolak"
            ? "Terlambat"
            : filters.status;
        query += " AND p.Status = ?";
        params.push(dbStatus);
      }

      if (filters.bulan && filters.bulan !== "") {
        query +=
          ' AND (p.Tanggal_Bayar IS NULL OR DATE_FORMAT(p.Tanggal_Bayar, "%m") = ?)';
        params.push(filters.bulan.padStart(2, "0"));
      }

      if (filters.tahun && filters.tahun !== "") {
        query +=
          ' AND (p.Tanggal_Bayar IS NULL OR DATE_FORMAT(p.Tanggal_Bayar, "%Y") = ?)';
        params.push(filters.tahun);
      }

      if (filters.kamar && filters.kamar !== "") {
        query += " AND r.No_Kamar = ?";
        params.push(filters.kamar);
      }

      query += " ORDER BY p.Tanggal_Bayar DESC, p.ID_Pembayaran DESC";

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update payment status
  static async updatePaymentStatus(paymentId, status, keterangan = null) {
    try {
      // Map admin status to database status
      const dbStatus =
        status === "Diterima"
          ? "Lunas"
          : status === "Menunggu"
          ? "Belum Bayar"
          : status === "Ditolak"
          ? "Terlambat"
          : status;

      const query = `
        UPDATE pembayaran 
        SET Status = ?
        WHERE ID_Pembayaran = ?
      `;

      const [result] = await pool.execute(query, [dbStatus, paymentId]);

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: "Pembayaran tidak ditemukan",
        };
      }

      // If payment is accepted, update the associated reservation status
      if (status === "Diterima") {
        await pool.execute(
          `
          UPDATE reservasi r
          INNER JOIN pembayaran p ON r.ID_Reservasi = p.ID_Reservasi
          SET r.Status = 'Diterima'
          WHERE p.ID_Pembayaran = ?
        `,
          [paymentId]
        );
      }

      return {
        success: true,
        message: `Status pembayaran berhasil diubah menjadi ${status}`,
      };
    } catch (error) {
      throw error;
    }
  }

  // Create new user by admin
  static async createByAdmin(userData) {
    const { Nama, Email, Password, No_telp, Alamat, Role = "penyewa" } = userData;

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(Password, 10);

      const query = `
        INSERT INTO user (Nama, No_telp, Alamat, Email, Password, Role) 
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [result] = await pool.execute(query, [
        Nama,
        No_telp,
        Alamat,
        Email,
        hashedPassword,
        Role,
      ]);

      return {
        success: true,
        message: "User created successfully",
        userId: result.insertId,
        data: {
          Nama,
          Email,
          No_telp,
          Alamat,
          Role,
        },
      };
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return {
          success: false,
          message: "Email already exists",
        };
      }
      return {
        success: false,
        message: "Failed to create user: " + error.message,
      };
    }
  }

  // Update user data
  static async updateUser(email, userData) {
    try {
      const { Nama, No_telp, Alamat, Role } = userData;

      const query = `
        UPDATE user 
        SET Nama = ?, No_telp = ?, Alamat = ?, Role = ?
        WHERE Email = ?
      `;

      const [result] = await pool.execute(query, [
        Nama,
        No_telp,
        Alamat,
        Role,
        email,
      ]);

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: "User not found",
        };
      }

      return {
        success: true,
        message: "User updated successfully",
        data: {
          Nama,
          Email: email,
          No_telp,
          Alamat,
          Role,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to update user: " + error.message,
      };
    }
  }

  // Delete user
  static async deleteUser(email) {
    try {
      // Check if user has active reservations
      const checkQuery = `
        SELECT COUNT(*) as count 
        FROM reservasi 
        WHERE Email = ? AND Status IN ('Telat/Belum Bayar', 'Aktif/Lunas')
      `;
      const [checkResult] = await pool.execute(checkQuery, [email]);

      if (checkResult[0].count > 0) {
        return {
          success: false,
          message: "Cannot delete user with active reservations",
        };
      }

      const query = "DELETE FROM user WHERE Email = ?";
      const [result] = await pool.execute(query, [email]);

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: "User not found",
        };
      }

      return {
        success: true,
        message: "User deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to delete user: " + error.message,
      };
    }
  }
}

module.exports = User;
