const express = require("express");
const router = express.Router();
const ReservasiController = require("../controllers/ReservasiController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const { validateReservation } = require("../middleware/validation");

// User routes (protected)
router.post(
  "/",
  authenticateToken,
  validateReservation,
  ReservasiController.create
);
router.get(
  "/my-reservations",
  authenticateToken,
  ReservasiController.getUserReservations
);

// Get reservations by user ID (for admin or user themselves)
router.get(
  "/user/:userID",
  authenticateToken,
  ReservasiController.getReservasiByUser
);

// Admin routes (protected + admin only)
router.get("/all", authenticateToken, requireAdmin, ReservasiController.getAll);
router.get(
  "/admin/with-payments",
  authenticateToken,
  requireAdmin,
  ReservasiController.getReservationsWithPayments
);
router.put(
  "/:id/status",
  authenticateToken,
  requireAdmin,
  ReservasiController.updateStatus
);
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  ReservasiController.deleteReservasi
);

module.exports = router;
