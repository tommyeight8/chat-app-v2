// backend/src/socket/socketHandler.js (PRODUCTION-READY)
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import Message from "../models/messageModel.js";
import { ENV } from "../lib/env.js";
import sanitizeHtml from "sanitize-html";

let io;

// Store online users (userId -> socketId)
const onlineUsers = new Map();

// ==========================
// RATE LIMITING
// ==========================
const rateLimits = new Map();

const checkRateLimit = (userId, event, maxRequests = 10, windowMs = 1000) => {
  const key = `${userId}:${event}`;
  const now = Date.now();

  if (!rateLimits.has(key)) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  const entry = rateLimits.get(key);

  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + windowMs;
    return true;
  }

  if (entry.count >= maxRequests) return false;

  entry.count++;
  return true;
};

// ==========================
// SANITIZATION
// ==========================
const sanitizeText = (text) => {
  if (!text || typeof text !== "string") return "";
  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .trim()
    .substring(0, 5000);
};

// ==========================
// VALIDATION
// ==========================
const isValidMongoId = (id) => /^[a-f\d]{24}$/i.test(id);

// ==========================
// INITIALIZE SOCKET
// ==========================
export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin:
        ENV.NODE_ENV === "development"
          ? "http://localhost:5173"
          : ENV.FRONTEND_URL || "https://chat-app-0ith6.sevalla.app",
      credentials: true,
    },
    maxHttpBufferSize: 1e6, // 1MB max
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ==========================
  // AUTH MIDDLEWARE
  // ==========================
  io.use((socket, next) => {
    console.log("\n=== SOCKET AUTH ATTEMPT ===");
    console.log("Time:", new Date().toISOString());
    console.log("Socket ID:", socket.id);

    try {
      const cookieHeader = socket.handshake.headers.cookie;
      console.log("Cookie header exists:", !!cookieHeader);
      console.log("Cookie header:", cookieHeader);

      if (!cookieHeader) {
        console.error("❌ REJECTED: No cookie header");
        return next(new Error("Authentication required"));
      }

      const cookies = cookie.parse(cookieHeader);
      console.log("Parsed cookies:", Object.keys(cookies));

      const token = cookies.jwt || cookies.token;
      console.log("JWT token exists:", !!token);
      console.log(
        "JWT token (first 20 chars):",
        token ? token.substring(0, 20) + "..." : "N/A"
      );

      if (!token) {
        console.error("❌ REJECTED: No JWT in cookies");
        console.log("Available cookie keys:", Object.keys(cookies));
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(token, ENV.JWT_SECRET);
      console.log("Token decoded successfully");
      console.log("Decoded payload keys:", Object.keys(decoded));

      const userId = decoded.userId || decoded.id || decoded._id;
      console.log("Extracted userId:", userId);

      if (!userId) {
        console.error("❌ REJECTED: No userId in token");
        console.log("Full decoded token:", decoded);
        return next(new Error("Invalid token payload"));
      }

      socket.userId = userId;

      // Limit to 5 connections per user
      const existing = [...io.sockets.sockets.values()].filter(
        (s) => s.userId === userId
      );
      console.log("Existing connections for user:", existing.length);

      if (existing.length >= 5) {
        console.error("❌ REJECTED: Too many connections");
        return next(new Error("Too many active connections"));
      }

      console.log(`✅ ACCEPTED: User ${userId} authenticated`);
      console.log("===========================\n");
      next();
    } catch (err) {
      console.error("❌ REJECTED: Auth error");
      console.error("Error:", err.message);
      console.error("Stack:", err.stack);
      console.log("===========================\n");
      return next(new Error("Authentication failed"));
    }
  });

  // ==========================
  // CONNECTION HANDLER
  // ==========================
  io.on("connection", (socket) => {
    const userId = socket.userId;

    console.log(`✅ User connected: ${userId}`);
    onlineUsers.set(userId, socket.id);

    socket.join(userId);
    io.emit("user_online", { userId });
    socket.emit("online_users", { users: [...onlineUsers.keys()] });

    // ==========================
    // SEND MESSAGE
    // ==========================
    socket.on("send_message", () => {
      console.log("⚠️ Socket message ignored — REST handles sending");
    });
    // ==========================
    // MARK READ
    // ==========================
    socket.on("mark_read", async ({ senderId }) => {
      try {
        if (!isValidMongoId(senderId)) throw new Error("Invalid sender ID");

        const result = await Message.updateMany(
          { senderId, receiverId: userId, read: false },
          { $set: { read: true } }
        );

        io.to(senderId).emit("messages_read", {
          readBy: userId,
          count: result.modifiedCount,
        });

        socket.emit("mark_read_success", {
          senderId,
          count: result.modifiedCount,
        });
      } catch (err) {
        socket.emit("mark_read_error", { error: err.message });
      }
    });

    // ==========================
    // TYPING EVENTS
    // ==========================
    let typingTimeout = null;

    socket.on("typing", ({ receiverId }) => {
      if (!isValidMongoId(receiverId)) return;
      if (!checkRateLimit(userId, "typing", 2, 1000)) return;

      io.to(receiverId).emit("user_typing", { userId });

      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        io.to(receiverId).emit("user_stop_typing", { userId });
      }, 5000);
    });

    socket.on("stop_typing", ({ receiverId }) => {
      if (!isValidMongoId(receiverId)) return;

      clearTimeout(typingTimeout);
      io.to(receiverId).emit("user_stop_typing", { userId });
    });

    // ==========================
    // DISCONNECT
    // ==========================
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("user_offline", { userId });

      // Cleanup rate limits
      for (const key of rateLimits.keys()) {
        if (key.startsWith(userId)) rateLimits.delete(key);
      }

      clearTimeout(typingTimeout);
      console.log(`❌ User disconnected: ${userId}`);
    });
  });

  // ==========================
  // CLEANUP RATE LIMITS
  // ==========================
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimits) {
      if (now > entry.resetAt + 300000) rateLimits.delete(key);
    }
  }, 300000);

  console.log("✅ Socket.io initialized");
  return io;
};

// Helpers
export const getIO = () => io;
export const getOnlineUsers = () => [...onlineUsers.keys()];
export const isUserOnline = (userId) => onlineUsers.has(userId);
export const sendToUser = (userId, event, data) => {
  if (!io) return false;
  io.to(userId).emit(event, data);
  return true;
};
