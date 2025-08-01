const Payment = require("../models/Payment");
const TmpUser = require("../models/TmpUser");
const path = require("path");
const fs = require("fs");

class PaymentController {
  // Get all payments for admin (Admin only)
  static async getAllPayments(req, res) {
    try {
      const result = await Payment.getAllPayments();

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Get all payments error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Upload payment proof (User)
  static async uploadPaymentProof(req, res) {
    try {
      const { reservationId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Bukti pembayaran is required",
        });
      }

      const buktiPembayaranPath = path
        .join("uploads", "bukti_pembayaran", req.file.filename)
        .replace(/\\/g, "/");

      const result = await Payment.createMonthlyPayment(
        reservationId,
        buktiPembayaranPath
      );

      if (!result.success) {
        // Delete uploaded file if creation failed
        if (fs.existsSync(buktiPembayaranPath)) {
          fs.unlinkSync(buktiPembayaranPath);
        }
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message:
          "Payment proof uploaded successfully. Waiting for admin verification.",
        data: {
          paymentId: result.paymentId,
        },
      });
    } catch (error) {
      console.error("Upload payment proof error:", error);

      // Delete uploaded file if there was an error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update payment proof (User)
  static async updatePaymentProof(req, res) {
    try {
      const { paymentId } = req.params;
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Bukti pembayaran is required",
        });
      }
      const buktiPembayaranPath = path
        .join("uploads", "bukti_pembayaran", req.file.filename)
        .replace(/\\/g, "/");
      // Get current payment data to delete old file
      const currentPayment = await Payment.getPaymentById(paymentId);
      if (
        currentPayment.success &&
        currentPayment.data &&
        currentPayment.data.Bukti_Pembayaran
      ) {
        const oldFilePath = currentPayment.data.Bukti_Pembayaran;
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      const result = await Payment.updatePaymentProof(
        paymentId,
        buktiPembayaranPath
      );
      if (!result.success) {
        // Delete uploaded file if update failed
        if (fs.existsSync(buktiPembayaranPath)) {
          fs.unlinkSync(buktiPembayaranPath);
        }
        return res.status(400).json(result);
      }
      res.json({
        success: true,
        message: "Bukti pembayaran berhasil diupdate",
        data: result.data,
      });
    } catch (error) {
      console.error("Update payment proof error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get unpaid payment by reservation ID
  static async getUnpaidPaymentByReservation(req, res) {
    try {
      const { reservationId } = req.params;
      const result = await Payment.getUnpaidPaymentByReservation(reservationId);
      if (!result.success || !result.data) {
        return res.status(404).json({
          success: false,
          message: "No unpaid payment found for this reservation",
        });
      }
      res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Get unpaid payment error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update payment status (Admin only)
  static async updatePaymentStatus(req, res) {
    try {
      const { paymentId } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status pembayaran harus diisi",
        });
      }
      const result = await Payment.updatePaymentStatus(paymentId, status);
      if (!result.success) {
        return res.status(400).json(result);
      }
      res.json({
        success: true,
        message: `Payment status updated to ${status} successfully`,
        data: result.data,
      });
    } catch (error) {
      console.error("Update payment status error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get all pending payments (Admin only)
  static async getAllPendingPayments(req, res) {
    try {
      const result = await Payment.getAllPendingPayments();

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Get pending payments error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get payment history for a reservation (User/Admin)
  static async getPaymentHistory(req, res) {
    try {
      const { reservationId } = req.params;

      const result = await Payment.getPaymentHistory(reservationId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Get payment history error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update reservation statuses (Admin/Cron job)
  static async updateReservationStatuses(req, res) {
    try {
      const result = await TmpUser.updateReservationStatus();

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: "Reservation statuses updated successfully",
      });
    } catch (error) {
      console.error("Update reservation statuses error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Mark user as checkout (Admin only)
  static async markUserCheckout(req, res) {
    try {
      const { reservationId } = req.params;
      const { reason } = req.body;

      const result = await TmpUser.markAsCheckout(reservationId, reason);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: "User marked as checkout successfully",
      });
    } catch (error) {
      console.error("Mark user checkout error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Serve payment proof image
  static async getPaymentProof(req, res) {
    try {
      const { paymentId } = req.params;

      const result = await Payment.getPaymentById(paymentId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      const payment = result.data;

      if (!payment.Bukti_Pembayaran) {
        return res.status(404).json({
          success: false,
          message: "Payment proof not found",
        });
      }

      const imagePath = path.resolve(payment.Bukti_Pembayaran);

      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({
          success: false,
          message: "Payment proof file not found",
        });
      }

      res.sendFile(imagePath);
    } catch (error) {
      console.error("Get payment proof error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get user's payment history (User)
  static async getMyPaymentHistory(req, res) {
    try {
      const userEmail = req.user?.Email || req.user?.email;
      if (!userEmail) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const result = await Payment.getUserPaymentHistory(userEmail);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Get user payment history error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get monthly payment history with filters (User)
  static async getMonthlyPaymentHistory(req, res) {
    try {
      const userEmail = req.user?.Email || req.user?.email;
      if (!userEmail) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const { year, month, status } = req.query;

      const result = await Payment.getMonthlyPaymentHistory(userEmail, {
        year,
        month,
        status,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Get monthly payment history error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Create payment (User - legacy support)
  static async createPayment(req, res) {
    try {
      const paymentData = req.body;

      // Add bukti pembayaran file path if uploaded
      if (req.file) {
        paymentData.Bukti_Pembayaran = path
          .join("uploads", "bukti_pembayaran", req.file.filename)
          .replace(/\\/g, "/");
      }

      const result = await Payment.createPaymentLegacy(paymentData);

      if (!result.success) {
        // Delete uploaded file if creation failed
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json(result);
      }

      res.status(201).json({
        success: true,
        message: "Pembayaran berhasil disubmit! Menunggu verifikasi admin.",
        data: {
          paymentId: result.paymentId,
        },
      });
    } catch (error) {
      console.error("Create payment error:", error);

      // Delete uploaded file if there was an error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Generate monthly payments automatically (Admin only)
  static async generateMonthlyPayments(req, res) {
    try {
      console.log(
        `[${new Date().toISOString()}] Manual monthly payment generation triggered by admin`
      );

      // Get current date info
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1-12
      const currentYear = now.getFullYear();

      const result = await Payment.generateMonthlyPaymentsForAllUsers(
        currentMonth,
        currentYear
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: `Successfully generated ${result.generated} monthly payments`,
        data: {
          generated: result.generated,
          errors: result.errors || [],
          period: `${currentMonth}/${currentYear}`,
        },
      });
    } catch (error) {
      console.error("Generate monthly payments error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate monthly payments",
        error: error.message,
      });
    }
  }

  // Generate payments for specific month/year (Admin only)
  static async generateManualPayments(req, res) {
    try {
      const { month, year } = req.body;

      if (!month || !year) {
        return res.status(400).json({
          success: false,
          message: "Month and year are required",
        });
      }

      if (month < 1 || month > 12) {
        return res.status(400).json({
          success: false,
          message: "Month must be between 1 and 12",
        });
      }

      console.log(
        `Manual payment generation for ${month}/${year} triggered by admin`
      );

      const result = await Payment.generateMonthlyPaymentsForAllUsers(
        month,
        year
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: `Successfully generated ${result.generated} payments for ${month}/${year}`,
        data: {
          generated: result.generated,
          errors: result.errors || [],
          period: `${month}/${year}`,
        },
      });
    } catch (error) {
      console.error("Generate manual payments error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate manual payments",
        error: error.message,
      });
    }
  }

  // Get payment generation history (Admin only)
  static async getGenerationHistory(req, res) {
    try {
      const result = await Payment.getGenerationHistory();

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error("Get generation history error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get generation history",
        error: error.message,
      });
    }
  }

  // Verify payment (Admin only)
  static async verifyPayment(req, res) {
    try {
      const { paymentId } = req.params;
      const { status = "Diterima" } = req.body;

      const result = await Payment.updatePaymentStatus(paymentId, status);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        message: "Payment verified successfully",
        data: result.data,
      });
    } catch (error) {
      console.error("Verify payment error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify payment",
        error: error.message,
      });
    }
  }
}

module.exports = PaymentController;
