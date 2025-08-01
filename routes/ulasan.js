const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const UlasanController = require("../controllers/UlasanController");
const { authenticateToken } = require("../middleware/auth");

// Validation rules
const ulasanValidation = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating harus berupa angka antara 1-5"),
  body("ulasan")
    .isLength({ min: 10, max: 500 })
    .withMessage("Ulasan harus antara 10-500 karakter")
    .trim()
];

// Public routes
router.get("/", UlasanController.getAllUlasan);
router.get("/stats", UlasanController.getUlasanStats);

// Protected routes - require authentication
router.get("/my-reviews", authenticateToken, UlasanController.getUlasanByUser);
router.post("/", authenticateToken, ulasanValidation, UlasanController.createUlasan);
router.put("/", authenticateToken, ulasanValidation, UlasanController.updateUlasan);
router.delete("/", authenticateToken, UlasanController.deleteUlasan);

module.exports = router;
