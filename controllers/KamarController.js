const Kamar = require("../models/Kamar");

class KamarController {
  // Get all rooms
  static async getAll(req, res) {
    try {
      const rooms = await Kamar.getAll();

      res.json({
        success: true,
        data: rooms,
      });
    } catch (error) {
      console.error("Get all rooms error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get available rooms
  static async getAvailable(req, res) {
    try {
      const rooms = await Kamar.getAvailable();

      res.json({
        success: true,
        data: rooms,
      });
    } catch (error) {
      console.error("Get available rooms error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get room by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const room = await Kamar.getById(id);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: "Room not found",
        });
      }

      res.json({
        success: true,
        data: room,
      });
    } catch (error) {
      console.error("Get room by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update room availability (Admin only)
  static async updateAvailability(req, res) {
    try {
      const { id } = req.params;
      const { availability } = req.body;

      // Validate availability
      if (availability !== 0 && availability !== 1) {
        return res.status(400).json({
          success: false,
          message: "Availability must be 0 (not available) or 1 (available)",
        });
      }

      const result = await Kamar.updateAvailability(id, availability);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error("Update room availability error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Create new room (Admin only)
  static async create(req, res) {
    try {
      const { Nama_Kamar, Letak, Ketersediaan } = req.body;

      if (!Nama_Kamar || !Letak) {
        return res.status(400).json({
          success: false,
          message: "Nama kamar dan letak harus diisi",
        });
      }

      const result = await Kamar.create({
        Nama_Kamar,
        Letak,
        Ketersediaan: Ketersediaan !== undefined ? parseInt(Ketersediaan) : 1,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json(result);
    } catch (error) {
      console.error("Create room error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update room (Admin only)
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { Nama_Kamar, Letak, Ketersediaan } = req.body;

      if (!Nama_Kamar || !Letak) {
        return res.status(400).json({
          success: false,
          message: "Nama kamar dan letak harus diisi",
        });
      }

      const result = await Kamar.update(id, {
        Nama_Kamar,
        Letak,
        Ketersediaan: parseInt(Ketersediaan),
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error("Update room error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete room (Admin only)
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await Kamar.delete(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error("Delete room error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = KamarController;
