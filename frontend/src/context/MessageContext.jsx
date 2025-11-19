import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { messageAPI } from "../services/messageApi";
import { useAuth } from "./AuthContext";
import socketService from "../services/socket";
import { PAGINATION } from "../config/constants";

import soundManager from "../utils/soundUtils";

const MessageContext = createContext(null);

export const MessageProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // ---------- STATE ----------
  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);

  // More granular loading flags
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [socketConnected, setSocketConnected] = useState(false);

  const currentChatRef = useRef(null);
  const setupListenersRef = useRef(false);

  // Keep ref in sync with currentChat for socket callbacks
  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  // ---------- HELPERS ----------
  const safeUserId = user?.id || user?._id || null;

  // ---------- LOADERS ----------
  const loadContacts = useCallback(async () => {
    try {
      setLoadingContacts(true);
      const data = await messageAPI.getAllContacts();
      setContacts(data.contacts || []);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to load contacts";
      setError(errorMessage);
      console.error("❌ Load contacts error:", errorMessage);
    } finally {
      setLoadingContacts(false);
    }
  }, []);

  const loadChats = useCallback(async () => {
    try {
      // This is used by ChatList and some socket callbacks,
      // but we DO NOT clear chats before loading, so no flicker.
      setLoadingChats(true);
      const data = await messageAPI.getChatPartners();
      setChats(data.chats || []);
      setError(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to load chats";
      setError(errorMessage);
      console.error("❌ Load chats error:", errorMessage);
    } finally {
      setLoadingChats(false);
    }
  }, []);

  const loadMessages = useCallback(
    async (userId) => {
      try {
        setLoadingMessages(true);

        const data = await messageAPI.getMessages(userId);
        setMessages(data.messages || []);
        setCurrentChat(data.user || null);
        setHasMore(data.hasMore || false);
        setError(null);

        // Mark as read
        if (socketService.isConnected()) {
          socketService.markMessagesRead(userId);
        }

        // Refresh chats (unread counts, lastMessage, etc)
        // NOTE: this sets loadingChats but does not blank the list
        loadChats();

        return data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to load messages";
        setError(errorMessage);
        console.error("❌ Load messages error:", errorMessage);
        return null;
      } finally {
        setLoadingMessages(false);
      }
    },
    [loadChats]
  );

  const loadMoreMessages = useCallback(async () => {
    if (!currentChatRef.current || loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);

      const oldestMessage = messages[0];
      if (!oldestMessage) {
        setHasMore(false);
        return;
      }

      const cursor = oldestMessage.createdAt;
      console.log(`📜 Loading more messages before: ${cursor}`);

      const data = await messageAPI.getMessages(
        currentChatRef.current._id,
        cursor, // before
        PAGINATION.MESSAGES_PER_PAGE // limit
      );

      if (data.messages && data.messages.length > 0) {
        setMessages((prev) => [...data.messages, ...prev]);
        setHasMore(data.hasMore || false);
        console.log(`✅ Loaded ${data.messages.length} more messages`);
      } else {
        setHasMore(false);
        console.log("📭 No more messages to load");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to load more messages";
      console.error("❌ Load more messages error:", errorMessage);
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoadingMore(false);
    }
  }, [messages, loadingMore, hasMore]);

  // ---------- SENDERS ----------
  const sendMessage = useCallback(
    async (receiverId, text) => {
      const trimmed = text?.trim();
      if (!trimmed) {
        console.warn("⚠️ Cannot send empty message");
        return;
      }

      try {
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        const optimisticMessage = {
          _id: tempId,
          senderId: safeUserId,
          receiverId,
          text: trimmed,
          createdAt: new Date().toISOString(),
          read: false,
        };

        // Optimistic UI
        setMessages((prev) => [...prev, optimisticMessage]);

        const data = await messageAPI.sendMessage(receiverId, trimmed);

        setMessages((prev) =>
          prev.map((msg) => (msg._id === tempId ? data.message : msg))
        );

        await loadChats();

        return data.message;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to send message";
        console.error("❌ Send message error:", errorMessage);

        // Rollback optimistic temp messages
        setMessages((prev) =>
          prev.filter((msg) => !msg._id?.startsWith("temp-"))
        );

        setError(errorMessage);
        setTimeout(() => setError(null), 3000);

        throw err;
      }
    },
    [safeUserId, loadChats]
  );

  const sendImageMessage = useCallback(
    async (receiverId, imageFile, text = "") => {
      try {
        const data = await messageAPI.sendImageMessage(
          receiverId,
          imageFile,
          text
        );
        setMessages((prev) => [...prev, data.message]);
        await loadChats();
        return data.message;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to send image";
        console.error("❌ Send image error:", errorMessage);
        setError(errorMessage);
        setTimeout(() => setError(null), 3000);
        throw err;
      }
    },
    [loadChats]
  );

  // ---------- CHAT SELECTION ----------
  const selectChat = useCallback(
    async (chatUser) => {
      // We keep currentChat immediately for UI highlight
      setCurrentChat(chatUser);
      setIsTyping(false);
      setHasMore(true);

      // Now load messages (this will only set loadingMessages,
      // so the sidebar won't flicker)
      await loadMessages(chatUser._id);
    },
    [loadMessages]
  );

  const clearCurrentChat = useCallback(() => {
    setCurrentChat(null);
    setMessages([]);
    setIsTyping(false);
    setHasMore(true);
  }, []);

  // ---------- TYPING ----------
  const emitTyping = useCallback(() => {
    if (currentChatRef.current && socketService.isConnected()) {
      socketService.emitTyping(currentChatRef.current._id);
    }
  }, []);

  const emitStopTyping = useCallback(() => {
    if (currentChatRef.current && socketService.isConnected()) {
      socketService.emitStopTyping(currentChatRef.current._id);
    }
  }, []);

  // ---------- ONLINE STATUS ----------
  const isUserOnline = useCallback(
    (userId) => {
      return onlineUsers.has(String(userId));
    },
    [onlineUsers]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ---------- SOCKET LISTENERS ----------
  const setupSocketListeners = useCallback(() => {
    if (setupListenersRef.current) {
      console.log("⚠️ Listeners already set up, skipping");
      return;
    }

    console.log("👂 Setting up socket listeners");
    setupListenersRef.current = true;

    // Initial online users
    socketService.onOnlineUsers((data) => {
      console.log("👥 Initial online users:", data.users);
      setOnlineUsers(new Set(data.users.map(String)));
    });

    socketService.onNewMessage((data) => {
      const { message, from } = data;

      console.log("📨 New message received:", {
        from,
        currentChatId: currentChatRef.current?._id,
        isFromCurrentChat: currentChatRef.current?._id === from,
      });

      // Ignore own messages to prevent duplicates
      if (from === safeUserId) {
        console.log("⚠️ Ignoring own message from socket");
        return;
      }

      // ✅ Play notification sound
      soundManager.play("notification");

      if (currentChatRef.current?._id === from) {
        // Append to current message list
        setMessages((prev) => {
          if (prev.find((m) => m._id === message._id)) {
            console.log("⚠️ Duplicate message ignored");
            return prev;
          }
          console.log("📥 Appending new incoming message");
          return [...prev, message];
        });

        socketService.markMessagesRead(from);
      } else {
        console.log("📬 Message from other chat — updating chat list only");
      }

      // Refresh chats list (unread, lastMessage, etc)
      loadChats();
    });

    socketService.onMessagesRead((data) => {
      const { readBy, count } = data;
      console.log(`✓ ${count} messages read by ${readBy}`);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.receiverId === readBy ? { ...msg, read: true } : msg
        )
      );

      loadChats();
    });

    socketService.onUserTyping((data) => {
      if (currentChatRef.current?._id === data.userId) {
        console.log("⌨️ User is typing:", data.userId);
        setIsTyping(true);
      }
    });

    socketService.onUserStopTyping((data) => {
      if (currentChatRef.current?._id === data.userId) {
        console.log("⏸️ User stopped typing:", data.userId);
        setIsTyping(false);
      }
    });

    socketService.onUserOnline((data) => {
      console.log("🟢 User came online:", data.userId);
      setOnlineUsers((prev) => new Set([...prev, String(data.userId)]));
    });

    socketService.onUserOffline((data) => {
      console.log("🔴 User went offline:", data.userId);
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(String(data.userId));
        return next;
      });
    });
  }, [safeUserId, loadChats]);

  // ---------- SOCKET LIFECYCLE ----------
  useEffect(() => {
    if (isAuthenticated && safeUserId) {
      console.log("🔌 User authenticated, connecting socket");

      socketService.connect();
      setSocketConnected(true);
      setupSocketListeners();

      return () => {
        console.log("🧹 Cleaning up socket connection");
        setupListenersRef.current = false;
        socketService.removeAllListeners();
        socketService.disconnect();
        setSocketConnected(false);
      };
    } else {
      console.log("👤 Not authenticated, disconnecting socket");
      setupListenersRef.current = false;
      socketService.disconnect();
      setSocketConnected(false);

      // Clear state on logout
      setContacts([]);
      setChats([]);
      setCurrentChat(null);
      setMessages([]);
      setOnlineUsers(new Set());
    }
  }, [isAuthenticated, safeUserId, setupSocketListeners]);

  // ---------- INITIAL DATA LOAD ----------
  useEffect(() => {
    if (isAuthenticated) {
      // Load contacts & chats once user is authenticated
      loadContacts();
      loadChats();
    }
  }, [isAuthenticated, loadContacts, loadChats]);

  // ---------- CONTEXT VALUE (MEMOIZED) ----------
  const value = useMemo(
    () => ({
      // data
      contacts,
      chats,
      currentChat,
      messages,
      hasMore,
      isTyping,
      onlineUsers,

      // loading flags
      loadingContacts,
      loadingChats,
      loadingMessages,
      loadingMore,

      // errors
      error,

      // socket
      socketConnected,

      // actions
      loadContacts,
      loadChats,
      loadMessages,
      loadMoreMessages,
      sendMessage,
      sendImageMessage,
      selectChat,
      clearCurrentChat,
      emitTyping,
      emitStopTyping,
      isUserOnline,
      clearError,
    }),
    [
      contacts,
      chats,
      currentChat,
      messages,
      hasMore,
      isTyping,
      onlineUsers,
      loadingContacts,
      loadingChats,
      loadingMessages,
      loadingMore,
      error,
      socketConnected,
      loadContacts,
      loadChats,
      loadMessages,
      loadMoreMessages,
      sendMessage,
      sendImageMessage,
      selectChat,
      clearCurrentChat,
      emitTyping,
      emitStopTyping,
      isUserOnline,
      clearError,
    ]
  );

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
