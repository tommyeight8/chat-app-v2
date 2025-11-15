// backend/server.js (UPDATED WITH SOCKET.IO)
// Replace your existing server.js with this

import express from "express";
import { createServer } from "http"; // ← Add this for Socket.io
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/message.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { initializeSocket } from "./socket/socketHandler.js"; // ← Add this

dotenv.config();

const app = express();
const httpServer = createServer(app); // ← Create HTTP server for Socket.io

app.set("trust proxy", true); // ✅ Fix Arcjet seeing proxy IPs

const __dirname = path.resolve();
const PORT = ENV.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(
    "🕵️ Client IP:",
    req.ip,
    "Forwarded for:",
    req.headers["x-forwarded-for"]
  );
  next();
});

// Initialize Socket.io
initializeSocket(httpServer); // ← Add this
console.log("✅ Socket.io initialized");

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Serve frontend in production
if (ENV.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  console.log("📦 Serving frontend from:", frontendPath);

  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ✅ Use httpServer.listen instead of app.listen
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🚀 Socket.io ready for connections`);
  connectDB();
});
