const { pool } = require("../config/database");

class Kamar {
  // Get all rooms
  static async getAll() {
    try {
      const query = "SELECT * FROM kamar ORDER BY No_Kamar";
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get available rooms
  static async getAvailable() {
    try {
      const query =
        "SELECT * FROM kamar WHERE Ketersediaan = 1 ORDER BY No_Kamar";
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get room by ID
  static async getById(roomId) {
    try {
      const query = "SELECT * FROM kamar WHERE No_Kamar = ?";
      const [rows] = await pool.execute(query, [roomId]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Update room availability
  static async updateAvailability(roomId, availability) {
    try {
      const query = "UPDATE kamar SET Ketersediaan = ? WHERE No_Kamar = ?";
      const [result] = await pool.execute(query, [availability, roomId]);

      return {
        success: result.affectedRows > 0,
        message:
          result.affectedRows > 0
            ? "Room availability updated"
            : "Room not found",
      };
    } catch (error) {
      throw error;
    }
  }

  // Create new room
  static async create(roomData) {
    try {
      const { Nama_Kamar, Letak, Ketersediaan = 1 } = roomData;

      const query = `
        INSERT INTO kamar (Nama_Kamar, Letak, Ketersediaan) 
        VALUES (?, ?, ?)
      `;

      const [result] = await pool.execute(query, [
        Nama_Kamar,
        Letak,
        Ketersediaan,
      ]);

      return {
        success: true,
        message: "Room created successfully",
        roomId: result.insertId,
        data: {
          No_Kamar: result.insertId,
          Nama_Kamar,
          Letak,
          Ketersediaan,
        },
      };
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return {
          success: false,
          message: "Room name already exists",
        };
      }
      return {
        success: false,
        message: "Failed to create room: " + error.message,
      };
    }
  }

  // Update room data
  static async update(roomId, roomData) {
    try {
      const { Nama_Kamar, Letak, Ketersediaan } = roomData;

      const query = `
        UPDATE kamar 
        SET Nama_Kamar = ?, Letak = ?, Ketersediaan = ? 
        WHERE No_Kamar = ?
      `;

      const [result] = await pool.execute(query, [
        Nama_Kamar,
        Letak,
        Ketersediaan,
        roomId,
      ]);

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: "Room not found",
        };
      }

      return {
        success: true,
        message: "Room updated successfully",
        data: {
          No_Kamar: roomId,
          Nama_Kamar,
          Letak,
          Ketersediaan,
        },
      };
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return {
          success: false,
          message: "Room name already exists",
        };
      }
      return {
        success: false,
        message: "Failed to update room: " + error.message,
      };
    }
  }

  // Delete room
  static async delete(id) {
    try {
      // Check if room has active reservations
      const checkQuery = `
        SELECT COUNT(*) as count 
        FROM reservasi 
        WHERE No_Kamar = ? AND Status IN ('Telat/Belum Bayar', 'Aktif/Lunas')
      `;
      const [checkResult] = await pool.execute(checkQuery, [id]);

      if (checkResult[0].count > 0) {
        return {
          success: false,
          message: "Cannot delete room with active reservations",
        };
      }

      // Delete room
      const query = "DELETE FROM kamar WHERE No_Kamar = ?";
      const [result] = await pool.execute(query, [id]);

      if (result.affectedRows === 0) {
        return {
          success: false,
          message: "Room not found",
        };
      }

      return {
        success: true,
        message: "Room deleted successfully",
      };
    } catch (error) {
      console.error("Delete room error:", error);
      return {
        success: false,
        message: "Failed to delete room: " + error.message,
      };
    }
  }
}

module.exports = Kamar;
