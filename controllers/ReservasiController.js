const Reservasi = require("../models/Reservasi");

class ReservasiController {
  // Create new reservation
  static async create(req, res) {
    try {
      const reservationData = {
        ...req.body,
        Email: req.user.Email, // Use authenticated user's email
      };

      const result = await Reservasi.create(reservationData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json({
        success: true,
        message: "Reservation created successfully",
        data: {
          reservationId: result.reservationId,
        },
      });
    } catch (error) {
      console.error("Create reservation error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all reservations with payment info (Admin only)
  static async getReservationsWithPayments(req, res) {
    try {
      const { status, kamar, periode } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (kamar) filters.kamar = kamar;
      if (periode) filters.periode = periode;

      const reservations = await Reservasi.getAllWithPayments(filters);

      // Process reservations to update status based on payment status
      const processedReservations = reservations.map((reservation) => {
        // If latest payment status is not 'Diterima', set reservation status to 'Telat/Belum Bayar'
        // and clear the payment period display
        if (reservation.latest_payment_status !== "Diterima") {
          return {
            ...reservation,
            Status: "Telat/Belum Bayar",
            Periode_Pembayaran: null, // Clear payment period display
          };
        }
        return reservation;
      });

      res.json({
        success: true,
        message: "Reservations with payments retrieved successfully",
        data: processedReservations,
      });
    } catch (error) {
      console.error("Get reservations with payments error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all reservations (Admin only)
  static async getAll(req, res) {
    try {
      const reservations = await Reservasi.getAll();

      res.json({
        success: true,
        message: "All reservations retrieved successfully",
        data: reservations,
      });
    } catch (error) {
      console.error("Get all reservations error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get user reservations
  static async getUserReservations(req, res) {
    try {
      const userEmail = req.user.Email;

      const reservations = await Reservasi.getByUser(userEmail);

      res.json({
        success: true,
        message: "User reservations retrieved successfully",
        data: reservations,
      });
    } catch (error) {
      console.error("Get user reservations error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get reservations by user ID
  static async getReservasiByUser(req, res) {
    try {
      const { userID } = req.params;

      const reservations = await Reservasi.getByUserId(userID);

      res.json({
        success: true,
        message: "User reservations retrieved successfully",
        data: reservations,
      });
    } catch (error) {
      console.error("Get reservations by user error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update reservation status (Admin only)
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ["Menunggu", "Diterima", "Ditolak", "Keluar"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status. Must be one of: Menunggu, Diterima, Ditolak, Keluar",
        });
      }

      // Get reservation info before updating
      const reservation = await Reservasi.getById(id);
      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: "Reservation not found",
        });
      }

      const result = await Reservasi.updateStatus(id, status);

      if (!result.success) {
        return res.status(404).json(result);
      }

      // If status is "Keluar", update room availability to available (1)
      if (status === "Keluar") {
        const Kamar = require("../models/Kamar");
        await Kamar.updateAvailability(reservation.No_Kamar, 1);
        console.log(
          `Room ${reservation.No_Kamar} availability updated to available due to checkout`
        );
      }

      res.json({
        success: true,
        message: "Reservation status updated successfully",
        data: result,
      });
    } catch (error) {
      console.error("Update reservation status error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete reservation (Admin only)
  static async deleteReservasi(req, res) {
    try {
      const { id } = req.params;

      // Get reservation info before deleting to update room status
      const reservation = await Reservasi.getById(id);
      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: "Reservation not found",
        });
      }

      const result = await Reservasi.delete(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      // Update room availability to available (1) when reservation is deleted
      const Kamar = require("../models/Kamar");
      await Kamar.updateAvailability(reservation.No_Kamar, 1);
      console.log(
        `Room ${reservation.No_Kamar} availability updated to available due to reservation deletion`
      );

      res.json({
        success: true,
        message: "Reservation deleted successfully and room made available",
      });
    } catch (error) {
      console.error("Delete reservation error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

module.exports = ReservasiController;
