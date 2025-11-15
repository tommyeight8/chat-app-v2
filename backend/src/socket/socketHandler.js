// backend/src/socket/socketHandler.js
// Production Socket.io with JWT Authentication from httpOnly cookies

import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import Message from "../models/messageModel.js";
import { ENV } from "../lib/env.js";

let io;

// Store online users (userId -> socketId)
const onlineUsers = new Map();

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin:
        ENV.NODE_ENV === "development"
          ? "http://localhost:5173"
          : ENV.FRONTEND_URL || "https://chat-app-0ith6.sevalla.app",
      credentials: true, // CRITICAL: Must be true to send cookies
    },
  });

  // ===== JWT AUTHENTICATION MIDDLEWARE =====
  io.use(async (socket, next) => {
    try {
      console.log("🔐 Socket auth attempt...");

      // Parse cookies from handshake headers
      const cookieHeader = socket.handshake.headers.cookie;

      if (!cookieHeader) {
        console.error("❌ No cookies in request");
        return next(new Error("Authentication required"));
      }

      const cookies = cookie.parse(cookieHeader);
      console.log("🍪 Cookies found:", Object.keys(cookies));

      // Get JWT from httpOnly cookie (adjust cookie name if different)
      const token = cookies.jwt || cookies.token;

      if (!token) {
        console.error("❌ No JWT token in cookies");
        return next(new Error("Authentication token required"));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, ENV.JWT_SECRET);

      // Extract userId (adjust based on your JWT payload structure)
      socket.userId = decoded.userId || decoded.id || decoded._id;

      if (!socket.userId) {
        console.error("❌ No userId in JWT payload:", decoded);
        return next(new Error("Invalid token payload"));
      }

      console.log(`✅ Socket auth successful for user: ${socket.userId}`);
      next();
    } catch (error) {
      console.error("❌ Socket auth error:", error.message);

      if (error.name === "JsonWebTokenError") {
        return next(new Error("Invalid authentication token"));
      }
      if (error.name === "TokenExpiredError") {
        return next(new Error("Authentication token expired"));
      }

      next(new Error("Authentication failed"));
    }
  });

  // ===== CONNECTION HANDLER =====
  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`✅ User connected: ${userId}`);

    // Store user as online
    onlineUsers.set(userId, socket.id);

    // Join user's personal room
    socket.join(userId);

    // Broadcast online status to all users
    io.emit("user_online", { userId });

    // Send current online users to the newly connected user
    socket.emit("online_users", { users: Array.from(onlineUsers.keys()) });

    // ===== MESSAGE EVENTS =====

    // Send message
    socket.on("send_message", async (data) => {
      try {
        const { receiverId, text, image, tempId } = data;

        console.log(`📤 Sending message: ${userId} → ${receiverId}`);

        // Validate input
        if (!receiverId) {
          throw new Error("Receiver ID required");
        }

        if (!text && !image) {
          throw new Error("Message must contain text or image");
        }

        // Save message to database
        const message = await Message.create({
          senderId: userId,
          receiverId,
          text: text || "",
          image: image || null,
          read: false,
        });

        console.log(`✅ Message saved to DB: ${message._id}`);

        // Send to receiver in real-time (if online)
        const delivered = io.to(receiverId).emit("new_message", {
          message,
          from: userId,
        });

        console.log(`✅ Message delivered: ${userId} → ${receiverId}`);

        // Send confirmation to sender
        socket.emit("message_sent", {
          tempId: tempId, // For optimistic updates
          message,
        });

        console.log(`✅ Confirmation sent to sender`);
      } catch (error) {
        console.error("❌ Send message error:", error);
        socket.emit("message_error", {
          error: error.message || "Failed to send message",
          tempId: data.tempId,
        });
      }
    });

    // Mark messages as read
    socket.on("mark_read", async (data) => {
      try {
        const { senderId } = data;

        console.log(`📖 Marking messages as read: ${senderId} → ${userId}`);

        // Update all unread messages from this sender
        const result = await Message.updateMany(
          {
            senderId: senderId,
            receiverId: userId,
            read: false,
          },
          {
            $set: { read: true },
          }
        );

        console.log(`✅ Marked ${result.modifiedCount} messages as read`);

        // Notify sender that messages were read
        io.to(senderId).emit("messages_read", {
          readBy: userId,
          count: result.modifiedCount,
        });

        // Acknowledge to current user
        socket.emit("mark_read_success", {
          senderId,
          count: result.modifiedCount,
        });
      } catch (error) {
        console.error("❌ Mark read error:", error);
        socket.emit("mark_read_error", {
          error: error.message,
        });
      }
    });

    // ===== TYPING INDICATORS =====

    socket.on("typing", (data) => {
      const { receiverId } = data;

      if (!receiverId) {
        return;
      }

      console.log(`⌨️ User typing: ${userId} → ${receiverId}`);

      io.to(receiverId).emit("user_typing", {
        userId,
      });
    });

    socket.on("stop_typing", (data) => {
      const { receiverId } = data;

      if (!receiverId) {
        return;
      }

      console.log(`⏸️ User stopped typing: ${userId} → ${receiverId}`);

      io.to(receiverId).emit("user_stop_typing", {
        userId,
      });
    });

    // ===== DISCONNECT =====

    socket.on("disconnect", (reason) => {
      console.log(`❌ User disconnected: ${userId} (${reason})`);

      // Remove from online users
      onlineUsers.delete(userId);

      // Broadcast offline status
      io.emit("user_offline", { userId });
    });

    // ===== ERROR HANDLING =====

    socket.on("error", (error) => {
      console.error(`❌ Socket error for user ${userId}:`, error);
    });
  });

  console.log("✅ Socket.io initialized with JWT authentication");
  return io;
};

// Get Socket.io instance
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

// Get online users
export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

// Check if user is online
export const isUserOnline = (userId) => {
  return onlineUsers.has(userId);
};

// Send message to specific user (for use in REST API routes)
export const sendToUser = (userId, event, data) => {
  if (!io) {
    console.warn("Socket.io not initialized");
    return false;
  }

  io.to(userId).emit(event, data);
  return true;
};
