// frontend/src/services/socket.js
// Production Socket.io client with automatic JWT cookie authentication

import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  // Connect to Socket.io server
  connect() {
    // Don't connect if already connected
    if (this.socket?.connected) {
      console.log("🔌 Socket already connected");
      return;
    }

    const SOCKET_URL =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:3000";

    console.log(`🔌 Connecting to socket: ${SOCKET_URL}`);

    // ===== CRITICAL: withCredentials sends httpOnly cookies =====
    this.socket = io(SOCKET_URL, {
      withCredentials: true, // Send cookies with request
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    // Setup connection event handlers
    this.socket.on("connect", () => {
      this.connected = true;
      console.log("✅ Socket connected:", this.socket.id);
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      this.connected = false;

      // Log more details about the error
      if (error.message.includes("Authentication")) {
        console.error("🔐 Authentication failed - check your login status");
      }
    });

    this.socket.on("disconnect", (reason) => {
      this.connected = false;
      console.log("🔌 Socket disconnected:", reason);

      if (reason === "io server disconnect") {
        // Server disconnected us, try to reconnect
        console.log("🔄 Attempting to reconnect...");
        this.socket.connect();
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`✅ Socket reconnected after ${attemptNumber} attempts`);
      this.connected = true;
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("❌ Socket reconnection error:", error.message);
    });

    this.socket.on("reconnect_failed", () => {
      console.error("❌ Socket reconnection failed");
      this.connected = false;
    });

    console.log("👂 Socket service initialized");
  }

  // Disconnect from Socket.io server
  disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting socket...");
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // ===== MESSAGE EVENTS =====

  // Send a message
  sendMessage() {
    console.warn("Socket sendMessage disabled — using REST API only.");
  }

  // Mark messages as read
  markMessagesRead(senderId) {
    if (!this.socket?.connected) {
      console.warn("⚠️ Socket not connected, cannot mark as read");
      return;
    }

    console.log(`📖 Marking messages as read from:`, senderId);

    this.socket.emit("mark_read", {
      senderId,
    });
  }

  // ===== TYPING INDICATORS =====

  // Emit typing indicator
  emitTyping(receiverId) {
    if (!this.socket?.connected) return;

    this.socket.emit("typing", { receiverId });
  }

  // Emit stop typing indicator
  emitStopTyping(receiverId) {
    if (!this.socket?.connected) return;

    this.socket.emit("stop_typing", { receiverId });
  }

  // ===== EVENT LISTENERS =====

  // Listen for new messages
  onNewMessage(callback) {
    if (!this.socket) return;

    this.socket.on("new_message", (data) => {
      console.log("📨 New message received:", data);
      callback(data);
    });

    this.listeners.set("new_message", callback);
  }

  // Listen for message sent confirmation
  onMessageSent(callback) {
    if (!this.socket) return;

    this.socket.on("message_sent", (data) => {
      console.log("✅ Message sent confirmation:", data);
      callback(data);
    });

    this.listeners.set("message_sent", callback);
  }

  // Listen for message errors
  onMessageError(callback) {
    if (!this.socket) return;

    this.socket.on("message_error", (data) => {
      console.error("❌ Message error:", data);
      callback(data);
    });

    this.listeners.set("message_error", callback);
  }

  // Listen for messages read receipts
  onMessagesRead(callback) {
    if (!this.socket) return;

    this.socket.on("messages_read", (data) => {
      console.log("✓ Messages marked as read:", data);
      callback(data);
    });

    this.listeners.set("messages_read", callback);
  }

  // Listen for typing indicators
  onUserTyping(callback) {
    if (!this.socket) return;

    this.socket.on("user_typing", (data) => {
      console.log("⌨️ User typing:", data.userId);
      callback(data);
    });

    this.listeners.set("user_typing", callback);
  }

  onUserStopTyping(callback) {
    if (!this.socket) return;

    this.socket.on("user_stop_typing", (data) => {
      console.log("⏸️ User stopped typing:", data.userId);
      callback(data);
    });

    this.listeners.set("user_stop_typing", callback);
  }

  // Listen for online/offline status
  onUserOnline(callback) {
    if (!this.socket) return;

    this.socket.on("user_online", (data) => {
      console.log("🟢 User online:", data.userId);
      callback(data);
    });

    this.listeners.set("user_online", callback);
  }

  onUserOffline(callback) {
    if (!this.socket) return;

    this.socket.on("user_offline", (data) => {
      console.log("🔴 User offline:", data.userId);
      callback(data);
    });

    this.listeners.set("user_offline", callback);
  }

  // Listen for initial online users list
  onOnlineUsers(callback) {
    if (!this.socket) return;

    this.socket.on("online_users", (data) => {
      console.log("👥 Online users:", data.users);
      callback(data);
    });

    this.listeners.set("online_users", callback);
  }

  // ===== CLEANUP =====

  // Remove all listeners
  removeAllListeners() {
    if (!this.socket) return;

    console.log("🧹 Removing all socket listeners");

    this.listeners.forEach((callback, event) => {
      this.socket.off(event);
    });

    this.listeners.clear();
  }

  // Remove specific listener
  removeListener(event) {
    if (!this.socket) return;

    this.socket.off(event);
    this.listeners.delete(event);
  }

  // ===== UTILITIES =====

  // Check if socket is connected
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  // Get socket ID
  getSocketId() {
    return this.socket?.id || null;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
