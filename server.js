const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { testConnection } = require("./config/database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create upload directories if they don't exist
const uploadDirs = ["uploads", "uploads/profiles", "uploads/bukti_pembayaran"];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/reservasi", require("./routes/reservasi"));
app.use("/api/kamar", require("./routes/kamar"));
app.use("/api/users", require("./routes/users"));
app.use("/api/tmp-users", require("./routes/tmp-users"));
app.use("/api/pending-reservasi", require("./routes/pending-reservasi"));
app.use("/api/payments", require("./routes/payments")); // Unified payment system
app.use("/api/scheduler", require("./routes/scheduler-control")); // Scheduler control
app.use("/api/ulasan", require("./routes/ulasan")); // Review system

// Serve uploaded files (bukti pembayaran)
app.use("/uploads", express.static("uploads"));

// Serve static files (HTML, CSS, JS)
app.use("/pages", express.static("pages"));
app.use("/css", express.static("css"));
app.use("/js", express.static("js"));
app.use("/Image", express.static("Image"));

// Root route - serve home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "home.html"));
});

// API info route
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to Kost Patemon API - Enhanced Payment System",
    version: "2.1.0",
    endpoints: {
      auth: "/api/auth",
      reservasi: "/api/reservasi",
      kamar: "/api/kamar",
      tmpUsers: "/api/tmp-users",
      pendingReservasi: "/api/pending-reservasi",
      payments: "/api/payments",
      users: "/api/users",
      ulasan: "/api/ulasan",
    },
    newEndpoints: {
      deleteReservation: "DELETE /api/reservasi/:id (Admin only)",
      deleteUserAccount: "DELETE /api/users/me (User)",
      updateReservationStatus:
        "PUT /api/reservasi/:id/status (Admin only - supports 'Keluar' status)",
      reviewSystem: "GET/POST/PUT/DELETE /api/ulasan (Full review CRUD)",
    },
    features: {
      autoStatusUpdate: "Daily payment status automation",
      paymentTracking: "Monthly payment history",
      adminDashboard: "Real-time statistics",
      unifiedPaymentAPI: "Single payment management system",
      roomAvailabilityUpdate: "Auto-update room status when reservation ends",
      reviewSystem: "User review and rating system",
      accountDeletion: "Safe account deletion with reservation check",
    },
  });
});

// Additional page routes
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "admin-dashboard.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "register.html"));
});

app.get("/kamar", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "kamar.html"));
});

app.get("/reservasi", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "reservasi.html"));
});

app.get("/akun", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "akun.html"));
});

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "home.html"));
});

app.get("/admin-pembayaran", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "admin-pembayaran.html"));
});

app.get("/admin-reservasi", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "admin-reservasi.html"));
});

app.get("/admin-pending-reservasi", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "admin-pending-reservasi.html"));
});

app.get("/data-kamar-admin", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "data-kamar-admin.html"));
});

app.get("/user-admin", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "user-admin.html"));
});

app.get("/riwayat-pembayaran", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "riwayat-pembayaran.html"));
});

// Routes with .html extension for direct HTML access
app.get("/home.html", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "home.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "login.html"));
});

app.get("/register.html", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "register.html"));
});

app.get("/kamar.html", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "kamar.html"));
});

app.get("/reservasi.html", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "reservasi.html"));
});

app.get("/akun.html", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "akun.html"));
});

app.get("/admin-dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "admin-dashboard.html"));
});

app.get("/admin-pembayaran.html", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "admin-pembayaran.html"));
});

app.get("/admin-reservasi.html", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "admin-reservasi.html"));
});

app.get("/admin-pending-reservasi.html", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "admin-pending-reservasi.html"));
});

app.get("/data-kamar-admin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "data-kamar-admin.html"));
});

app.get("/user-admin.html", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "user-admin.html"));
});

app.get("/riwayat-pembayaran.html", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "riwayat-pembayaran.html"));
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 API Base URL: http://localhost:${PORT}/api`);

  // Test database connection
  await testConnection();

  // Initialize payment scheduler
  console.log("🕐 Initializing Payment Scheduler...");
  const paymentScheduler = require("./services/payment-scheduler");
  paymentScheduler.init();

  // Log scheduler status
  const status = paymentScheduler.getDetailedStatus();
  console.log("📅 Scheduler Status:", {
    running: status.isRunning,
    nextRun: status.nextRunFormatted,
    timezone: status.timezone,
  });
});

module.exports = app;
