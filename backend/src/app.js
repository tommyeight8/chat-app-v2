// backend/server.js (CORRECTED)
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
          "res.cloudinary.com", // ✅ Add Cloudinary explicitly
        ],
        connectSrc: ["'self'", "https:", "wss:", ENV.FRONTEND_URL],
        fontSrc: ["'self'", "https:", "data:"], // ✅ Add fonts
        mediaSrc: ["'self'", "blob:", "https:"], // ✅ Add media
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS
app.use(
  cors({
    origin:
      ENV.NODE_ENV === "development"
        ? "http://localhost:5173"
        : ENV.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // ✅ Explicit methods
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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: ENV.NODE_ENV === "development" ? 1000 : 500, // ✅ Lower in prod
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: "Too many API requests, please slow down",
});

// ----------------------------
//  SOCKET.IO INITIALIZATION
// ----------------------------
const io = initializeSocket(httpServer);
app.set("io", io); // ✅ Make io accessible in routes

console.log("✅ Socket.io initialized");

// ----------------------------
//  ROUTES
// ----------------------------

// Health check (no rate limit)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/auth", apiLimiter, authRoutes);
app.use("/api/messages", apiLimiter, messageRoutes);

// ----------------------------
//  SERVE FRONTEND (Production)
// ----------------------------
if (ENV.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../../frontend/dist");

  console.log("📦 Serving frontend from:", frontendPath);

  // Serve static files
  app.use(
    express.static(frontendPath, {
      maxAge: "1d", // ✅ Cache static assets
      etag: true,
    })
  );

  // ✅ FIXED: Handle SPA routing but exclude API routes
  app.get("*", (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
      return res.status(404).json({
        success: false,
        message: "API endpoint not found",
      });
    }

    // Serve React app for all other routes
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ----------------------------
//  ERROR HANDLERS
// ----------------------------

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", {
    message: err.message,
    stack: ENV.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Don't leak error details in production
  res.status(err.status || 500).json({
    success: false,
    message:
      ENV.NODE_ENV === "production" ? "Internal server error" : err.message,
    ...(ENV.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ✅ REMOVED: Separate 404 handler (handled in wildcard above)

// ----------------------------
//  START SERVER
// ----------------------------
httpServer.listen(PORT, () => {
  console.log("\n🚀 ================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔒 Security: Helmet enabled`);
  console.log(`🚦 Rate limiting: Active`);
  console.log(`🗜️ Compression: Enabled`);
  console.log(`🚀 Socket.io: Ready`);
  console.log("🚀 ================================\n");

  connectDB();
});

// ✅ Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received, closing server gracefully...");
  httpServer.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});
