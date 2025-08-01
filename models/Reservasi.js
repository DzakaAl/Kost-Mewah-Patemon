const { pool } = require("../config/database");

class Reservasi {
  // Create new reservation
  static async create(reservationData) {
    const { No_Kamar, Email, Tanggal_Reservasi } = reservationData;

    try {
      // Check if room is available
      const roomQuery = "SELECT Ketersediaan FROM kamar WHERE No_Kamar = ?";
      const [roomRows] = await pool.execute(roomQuery, [No_Kamar]);

      if (roomRows.length === 0) {
        return {
          success: false,
          message: "Room not found",
        };
      }

      if (roomRows[0].Ketersediaan === 0) {
        return {
          success: false,
          message: "Room is not available",
        };
      }

      // Create reservation
      const query = `
                INSERT INTO reservasi (No_Kamar, Email, Tanggal_Reservasi, Status) 
                VALUES (?, ?, ?, 'Menunggu')
            `;

      const [result] = await pool.execute(query, [
        No_Kamar,
        Email,
        Tanggal_Reservasi,
      ]);

      return {
        success: true,
        message: "Reservation created successfully",
        reservationId: result.insertId,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user reservations
  static async getByUser(email) {
    try {
      const query = `
                SELECT r.*, k.Nama_Kamar, k.Letak 
                FROM reservasi r 
                JOIN kamar k ON r.No_Kamar = k.No_Kamar 
                WHERE r.Email = ?
                ORDER BY r.Tanggal_Reservasi DESC
            `;

      const [rows] = await pool.execute(query, [email]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get all reservations (for admin)
  static async getAll() {
    try {
      const query = `
                SELECT r.*, k.Nama_Kamar, k.Letak, u.Nama as Nama_User
                FROM reservasi r 
                JOIN kamar k ON r.No_Kamar = k.No_Kamar 
                JOIN user u ON r.Email = u.Email
                ORDER BY r.Tanggal_Reservasi DESC
            `;

      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get all reservations with payment info (for admin)
  static async getAllWithPayments(filters = {}) {
    try {
      let query = `
                SELECT 
                    r.*,
                    k.Nama_Kamar,
                    k.Letak,
                    u.Nama,
                    u.No_telp,
                    u.Alamat,
                    (
                        SELECT CONCAT(YEAR(p.Created_At), '-', LPAD(MONTH(p.Created_At), 2, '0'))
                        FROM pembayaran p 
                        WHERE p.ID_Reservasi = r.ID_Reservasi 
                        ORDER BY p.Created_At DESC 
                        LIMIT 1
                    ) as last_payment_period,
                    (
                        SELECT p.Status
                        FROM pembayaran p 
                        WHERE p.ID_Reservasi = r.ID_Reservasi 
                        ORDER BY p.Created_At DESC 
                        LIMIT 1
                    ) as latest_payment_status,
                    (
                        SELECT COUNT(*)
                        FROM pembayaran p 
                        WHERE p.ID_Reservasi = r.ID_Reservasi 
                        AND p.Status = 'Diterima'
                    ) as total_payments,
                    CASE 
                        WHEN (
                            SELECT p.Status
                            FROM pembayaran p 
                            WHERE p.ID_Reservasi = r.ID_Reservasi 
                            ORDER BY p.Created_At DESC 
                            LIMIT 1
                        ) = 'Diterima' THEN r.Status
                        WHEN (
                            SELECT COUNT(*)
                            FROM pembayaran p 
                            WHERE p.ID_Reservasi = r.ID_Reservasi
                        ) > 0 THEN 'Telat/Belum Bayar'
                        ELSE r.Status
                    END as calculated_status
                FROM reservasi r 
                JOIN kamar k ON r.No_Kamar = k.No_Kamar 
                JOIN user u ON r.Email = u.Email
            `;

      const whereConditions = [];
      const queryParams = [];

      if (filters.status) {
        whereConditions.push("r.Status = ?");
        queryParams.push(filters.status);
      }

      if (filters.kamar) {
        whereConditions.push("r.No_Kamar = ?");
        queryParams.push(filters.kamar);
      }

      if (filters.periode) {
        whereConditions.push(`
                    EXISTS (
                        SELECT 1 FROM pembayaran p 
                        WHERE p.ID_Reservasi = r.ID_Reservasi 
                        AND CONCAT(YEAR(p.Created_At), '-', LPAD(MONTH(p.Created_At), 2, '0')) = ?
                    )
                `);
        queryParams.push(filters.periode);
      }

      if (whereConditions.length > 0) {
        query += " WHERE " + whereConditions.join(" AND ");
      }

      query += " ORDER BY r.Tanggal_Reservasi DESC";

      const [rows] = await pool.execute(query, queryParams);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get reservations by user email with payment info and calculated status
  static async getByUserIdWithPayments(userEmail) {
    try {
      const query = `
                SELECT 
                    r.*,
                    k.Nama_Kamar,
                    k.Letak,
                    u.Nama,
                    u.No_telp,
                    u.Alamat,
                    (
                        SELECT CONCAT(YEAR(p.Created_At), '-', LPAD(MONTH(p.Created_At), 2, '0'))
                        FROM pembayaran p 
                        WHERE p.ID_Reservasi = r.ID_Reservasi 
                        ORDER BY p.Created_At DESC 
                        LIMIT 1
                    ) as periode,
                    (
                        SELECT p.Jumlah
                        FROM pembayaran p 
                        WHERE p.ID_Reservasi = r.ID_Reservasi 
                        ORDER BY p.Created_At DESC 
                        LIMIT 1
                    ) as Harga_Kamar,
                    (
                        SELECT p.Status
                        FROM pembayaran p 
                        WHERE p.ID_Reservasi = r.ID_Reservasi 
                        ORDER BY p.Created_At DESC 
                        LIMIT 1
                    ) as latest_payment_status,
                    (
                        SELECT COUNT(*)
                        FROM pembayaran p 
                        WHERE p.ID_Reservasi = r.ID_Reservasi 
                        AND p.Status = 'Diterima'
                    ) as total_payments,
                    CASE 
                        WHEN (
                            SELECT p.Status
                            FROM pembayaran p 
                            WHERE p.ID_Reservasi = r.ID_Reservasi 
                            ORDER BY p.Created_At DESC 
                            LIMIT 1
                        ) = 'Diterima' THEN 'Aktif/Lunas'
                        WHEN (
                            SELECT COUNT(*)
                            FROM pembayaran p 
                            WHERE p.ID_Reservasi = r.ID_Reservasi
                        ) > 0 THEN 'Telat/Belum Bayar'
                        ELSE r.Status
                    END as calculated_status
                FROM reservasi r 
                JOIN kamar k ON r.No_Kamar = k.No_Kamar 
                JOIN user u ON r.Email = u.Email
                WHERE u.Email = ?
                ORDER BY r.Tanggal_Reservasi DESC
            `;

      const [rows] = await pool.execute(query, [userEmail]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Update reservation status with notes (for admin)
  static async updateStatus(reservationId, status, keterangan = null) {
    try {
      const query = "UPDATE reservasi SET Status = ? WHERE ID_Reservasi = ?";
      const [result] = await pool.execute(query, [status, reservationId]);

      return {
        success: result.affectedRows > 0,
        message:
          result.affectedRows > 0
            ? "Reservation status updated"
            : "Reservation not found",
      };
    } catch (error) {
      throw error;
    }
  }

  // Get reservation by ID
  static async getById(id) {
    try {
      const query = "SELECT * FROM reservasi WHERE ID_Reservasi = ?";
      const [rows] = await pool.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Delete reservation by ID
  static async delete(id) {
    try {
      const query = "DELETE FROM reservasi WHERE ID_Reservasi = ?";
      const [result] = await pool.execute(query, [id]);

      return {
        success: result.affectedRows > 0,
        message:
          result.affectedRows > 0
            ? "Reservation deleted successfully"
            : "Reservation not found",
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Reservasi;
