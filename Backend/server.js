import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import artRoutes from "./routes/artRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import suggestionRoutes from "./routes/suggestionRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import validateTokenRoutes from "./routes/validateTokenRoutes.js";
import styleTransferRoutes from "./routes/styleTransferRoutes.js";
import paymentsRoutes from "./routes/payments.js"; // your payments router

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---

// Enable CORS for all origins (you can lock down to your frontend URL later)
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.options("*", cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use(
  "/profile-pictures",
  express.static(path.join(__dirname, "ProfileUpload"))
);
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);
// For serving your Razorpay logo (e.g. public/logo.png)
app.use(express.static(path.join(__dirname, "public")));

// --- Database Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- API Routes ---

// 1. Core art & user routes
app.use("/api", artRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/suggestions", suggestionRoutes);
app.use("/api/validate-token", validateTokenRoutes);
app.use("/api/style-transfer", styleTransferRoutes);

// 2. Image upload
app.use("/api/upload", uploadRoutes);

// 3. Payments (orders & verification)
//    → POST /api/payments/orders
//    → POST /api/payments/verify
app.use("/api/payments", paymentsRoutes);

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
