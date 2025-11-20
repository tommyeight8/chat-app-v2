// backend/server.js — FINAL CLEANED VERSION
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

// ---------------------------------------------------------
// Correct dirname for ESM
// ---------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = ENV.PORT || 3000;

// ---------------------------------------------------------
// SECURITY: Helmet CSP (Cloudflare, GCS, Cloudinary, SPA, sockets)
// ---------------------------------------------------------
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
          "res.cloudinary.com",
        ],
        connectSrc: ["'self'", "https:", "wss:", ENV.FRONTEND_URL],
        fontSrc: ["'self'", "https:", "data:"],
        mediaSrc: ["'self'", "blob:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// ---------------------------------------------------------
// CORS
// ---------------------------------------------------------
app.use(
  cors({
    origin:
      ENV.NODE_ENV === "development"
        ? "http://localhost:5173"
        : ENV.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// ---------------------------------------------------------
// Utility Middleware
// ---------------------------------------------------------
app.use(compression());
app.use(morgan(ENV.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Required if behind proxy (Sevalla, Cloudflare, Nginx)
app.set("trust proxy", 1);

// ---------------------------------------------------------
// Rate Limiting
// ---------------------------------------------------------
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: ENV.NODE_ENV === "development" ? 1000 : 500,
});
app.use(globalLimiter);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
});

// ---------------------------------------------------------
// SOCKET.IO
// ---------------------------------------------------------
const io = initializeSocket(httpServer);
app.set("io", io);

// ---------------------------------------------------------
// HEALTH CHECK
// ---------------------------------------------------------
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ---------------------------------------------------------
// API ROUTES
// ---------------------------------------------------------
app.use("/api/auth", apiLimiter, authRoutes);
app.use("/api/messages", apiLimiter, messageRoutes);

// ---------------------------------------------------------
// SERVE FRONTEND (PRODUCTION SPA MODE)
// ---------------------------------------------------------
if (ENV.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");

  app.use(
    express.static(frontendPath, {
      maxAge: "1d",
      etag: true,
    })
  );

  // SPA route handling — fallback to index.html
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
      return res
        .status(404)
        .json({ success: false, message: "API endpoint not found" });
    }
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ---------------------------------------------------------
// GLOBAL ERROR HANDLER
// ---------------------------------------------------------
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);

  res.status(err.status || 500).json({
    success: false,
    message:
      ENV.NODE_ENV === "production" ? "Internal server error" : err.message,
    ...(ENV.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ---------------------------------------------------------
// START SERVER
// ---------------------------------------------------------
httpServer.listen(PORT, () => {
  console.log("\n🚀 ================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🔒 Helmet security enabled");
  console.log("🚦 Rate limiting active");
  console.log("🗜️ Compression enabled");
  console.log("🔌 Socket.IO ready");
  console.log("📦 SPA frontend serving enabled");
  console.log("🚀 ================================\n");
  connectDB();
});

// ---------------------------------------------------------
// GRACEFUL SHUTDOWN
// ---------------------------------------------------------
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Closing...");
  httpServer.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});
