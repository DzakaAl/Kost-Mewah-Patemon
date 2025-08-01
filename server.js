const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { testConnection } = require("./config/database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

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

// Serve uploaded files (bukti pembayaran)
app.use("/uploads", express.static("uploads"));

// Serve static files (HTML, CSS, JS)
app.use("/pages", express.static("pages"));
app.use("/css", express.static("css"));
app.use("/js", express.static("js"));
app.use("/Image", express.static("Image"));

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Kost Patemon API - Enhanced Payment System",
    version: "2.0.0",
    endpoints: {
      auth: "/api/auth",
      reservasi: "/api/reservasi",
      kamar: "/api/kamar",
      tmpUsers: "/api/tmp-users",
      pendingReservasi: "/api/pending-reservasi",
      payments: "/api/payment/payments",
      paymentHistory: "/api/payment/my-payments",
      paymentProof: "/api/payment/{paymentId}/proof",
    },
    features: {
      autoStatusUpdate: "Daily payment status automation",
      paymentTracking: "Monthly payment history",
      adminDashboard: "Real-time statistics",
      unifiedPaymentAPI: "Single payment management system",
    },
  });
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
