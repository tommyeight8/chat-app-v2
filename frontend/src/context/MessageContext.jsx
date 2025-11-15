// frontend/src/context/MessageContext.jsx
// Production MessageContext with JWT cookie authentication
// FIXED: Clears unread badge after reading messages

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { messageAPI } from "../services/messageApi";
import { useAuth } from "./AuthContext";
import socketService from "../services/socket";

const MessageContext = createContext(null);

export const MessageProvider = ({ children }) => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Connect to Socket.io when user logs in
  useEffect(() => {
    if (user?.id) {
      console.log(`🔌 User logged in, connecting socket for user: ${user.id}`);

      // Connect (will automatically send JWT cookie)
      socketService.connect();

      // Setup Socket.io event listeners
      setupSocketListeners();

      // Cleanup on unmount or user change
      return () => {
        console.log("🧹 Cleaning up socket listeners");
        socketService.removeAllListeners();
        socketService.disconnect();
      };
    } else {
      // User logged out, disconnect socket
      console.log("👤 No user, disconnecting socket");
      socketService.disconnect();
    }
  }, [user?.id]);

  const setupSocketListeners = () => {
    console.log("👂 Setting up socket listeners");

    // Listen for initial online users list
    socketService.onOnlineUsers((data) => {
      console.log("👥 Initial online users:", data.users);
      setOnlineUsers(new Set(data.users));
    });

    // Listen for new messages
    socketService.onNewMessage((data) => {
      const { message, from } = data;

      console.log("📨 New message received:", {
        from,
        currentChatId: currentChat?._id,
        isFromCurrentChat: currentChat?._id === from,
      });

      // If message is from current chat, add to messages
      if (currentChat?._id === from) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.find((m) => m._id === message._id)) {
            console.log("⚠️ Duplicate message, ignoring");
            return prev;
          }
          console.log("✅ Adding message to current chat");
          return [...prev, message];
        });

        // Mark as read immediately
        socketService.markMessagesRead(from);
      } else {
        console.log("📬 Message from other user, updating chat list");
      }

      // Refresh chat list to update last message and unread count
      loadChats();
    });

    // Listen for message sent confirmation
    socketService.onMessageSent((data) => {
      const { tempId, message } = data;

      console.log("✅ Message sent confirmation:", {
        tempId,
        messageId: message._id,
      });

      // Replace temporary message with real one
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id === tempId) {
            console.log(
              `🔄 Replacing temp message ${tempId} with ${message._id}`
            );
            return message;
          }
          return msg;
        })
      );
    });

    // Listen for message errors
    socketService.onMessageError((data) => {
      const { error, tempId } = data;
      console.error("❌ Message send error:", error);

      // Remove failed message
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      setError(error);

      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    });

    // Listen for read receipts
    socketService.onMessagesRead((data) => {
      const { readBy, count } = data;

      console.log(`✓ ${count} messages read by ${readBy}`);

      // Update messages to this user as read
      setMessages((prev) =>
        prev.map((msg) =>
          msg.receiverId === readBy ? { ...msg, read: true } : msg
        )
      );

      // ✅ FIX: Refresh chat list to clear unread badge
      loadChats();
    });

    // Listen for typing indicators
    socketService.onUserTyping((data) => {
      if (currentChat?._id === data.userId) {
        console.log("⌨️ User is typing:", data.userId);
        setIsTyping(true);
      }
    });

    socketService.onUserStopTyping((data) => {
      if (currentChat?._id === data.userId) {
        console.log("⏸️ User stopped typing:", data.userId);
        setIsTyping(false);
      }
    });

    // Listen for online/offline status
    socketService.onUserOnline((data) => {
      console.log("🟢 User came online:", data.userId);
      setOnlineUsers((prev) => new Set([...prev, data.userId]));
    });

    socketService.onUserOffline((data) => {
      console.log("🔴 User went offline:", data.userId);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });
  };

  // Load all contacts
  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await messageAPI.getAllContacts();
      setContacts(data.contacts || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load contacts");
      console.error("Load contacts error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load chat partners
  const loadChats = useCallback(async () => {
    try {
      const data = await messageAPI.getChatPartners();
      setChats(data.chats || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load chats");
      console.error("Load chats error:", err);
    }
  }, []);

  // Load messages with a specific user
  const loadMessages = useCallback(
    async (userId) => {
      try {
        setLoading(true);
        const data = await messageAPI.getMessages(userId);
        setMessages(data.messages || []);
        setCurrentChat(data.user);
        setError(null);

        // Mark messages as read via socket
        if (socketService.isConnected()) {
          socketService.markMessagesRead(userId);
        }

        // ✅ FIX: Refresh chat list to update unread count
        loadChats();

        return data;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load messages");
        console.error("Load messages error:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [loadChats]
  );

  // Send text message via Socket.io (REAL-TIME!)
  const sendMessage = useCallback(
    async (receiverId, text) => {
      try {
        // Check socket connection
        if (!socketService.isConnected()) {
          throw new Error("Not connected to server. Please refresh the page.");
        }

        const tempId = `temp-${Date.now()}-${Math.random()}`;

        // Optimistically add message to UI
        const optimisticMessage = {
          _id: tempId,
          senderId: user?.id,
          receiverId,
          text,
          createdAt: new Date().toISOString(),
          read: false,
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        // Send via Socket.io for REAL-TIME delivery
        socketService.sendMessage(receiverId, text, null, tempId);

        // Refresh chat list
        await loadChats();

        return optimisticMessage;
      } catch (err) {
        const errorMessage =
          err.message ||
          err.response?.data?.message ||
          "Failed to send message";
        setError(errorMessage);
        console.error("Send message error:", err);

        // Clear error after 5 seconds
        setTimeout(() => setError(null), 5000);

        throw err;
      }
    },
    [user, loadChats]
  );

  // Send image message
  const sendImageMessage = useCallback(
    async (receiverId, imageFile) => {
      try {
        // Upload image via REST API
        const data = await messageAPI.sendImageMessage(receiverId, imageFile);

        // Add message to local state
        setMessages((prev) => [...prev, data.message]);

        // Emit via socket for real-time delivery (if connected)
        if (socketService.isConnected()) {
          socketService.sendMessage(receiverId, "", data.message.image);
        }

        // Refresh chats
        await loadChats();

        return data.message;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to send image");
        console.error("Send image error:", err);
        throw err;
      }
    },
    [loadChats]
  );

  // Select a chat
  const selectChat = useCallback(
    async (user) => {
      setCurrentChat(user);
      setIsTyping(false);
      await loadMessages(user._id);
    },
    [loadMessages]
  );

  // Clear current chat
  const clearCurrentChat = useCallback(() => {
    setCurrentChat(null);
    setMessages([]);
    setIsTyping(false);
  }, []);

  // Emit typing indicator
  const emitTyping = useCallback(() => {
    if (currentChat && socketService.isConnected()) {
      socketService.emitTyping(currentChat._id);
    }
  }, [currentChat]);

  // Emit stop typing indicator
  const emitStopTyping = useCallback(() => {
    if (currentChat && socketService.isConnected()) {
      socketService.emitStopTyping(currentChat._id);
    }
  }, [currentChat]);

  // Check if user is online
  const isUserOnline = useCallback(
    (userId) => {
      return onlineUsers.has(userId);
    },
    [onlineUsers]
  );

  const value = {
    contacts,
    chats,
    currentChat,
    messages,
    loading,
    error,
    isTyping,
    onlineUsers, // Expose online users set
    socketConnected: socketService.isConnected(),
    loadContacts,
    loadChats,
    loadMessages,
    sendMessage,
    sendImageMessage,
    selectChat,
    clearCurrentChat,
    emitTyping,
    emitStopTyping,
    isUserOnline,
  };

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessageProvider");
  }
  return context;
};
