const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Admin routes (protected + admin only)
router.get("/", authenticateToken, requireAdmin, UserController.getAllUsers);
router.get("/:email", authenticateToken, requireAdmin, UserController.getUserByEmail);
router.post("/", authenticateToken, requireAdmin, UserController.createUser);
router.put("/:email", authenticateToken, requireAdmin, UserController.updateUser);
router.delete("/:email", authenticateToken, requireAdmin, UserController.deleteUser);

module.exports = router;
