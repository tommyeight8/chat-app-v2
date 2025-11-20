// backend/server.js
import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/message.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { initializeSocket } from "./socket/socketHandler.js";

dotenv.config();

// --- Fix dirname for ESM ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const PORT = ENV.PORT || 3000;

// ----------------------------
//  SECURITY MIDDLEWARE
// ----------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:",
          "*.googleapis.com",
          "*.cloudflare.com",
        ],
        connectSrc: [
          "'self'",
          "https:",
          "wss:",
          ENV.FRONTEND_URL, // socket.io + api
        ],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS (Sevalla uses HTTPS domain)
app.use(
  cors({
    origin:
      ENV.NODE_ENV === "development"
        ? "http://localhost:5173"
        : ENV.FRONTEND_URL,
    credentials: true,
  })
);

// Compression, logging, limits
app.use(compression());
app.use(morgan(ENV.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});
app.use(globalLimiter);

// Per-API limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
});

// Socket.IO
initializeSocket(httpServer);

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// API
app.use("/api/auth", apiLimiter, authRoutes);
app.use("/api/messages", apiLimiter, messageRoutes);

// ----------------------------
//  SERVE FRONTEND (Sevalla)
// ----------------------------
if (ENV.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  console.log("📦 Serving frontend:", frontendPath);

  app.use(express.static(frontendPath));

  // React Router SPA handler
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ----------------------------
//  GLOBAL ERROR HANDLER
// ----------------------------
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);
  res.status(err.status || 500).json({
    success: false,
    message:
      ENV.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// 404 fallback
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found" })
);

// ----------------------------
//  START SERVER + DB
// ----------------------------
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  connectDB();
});
