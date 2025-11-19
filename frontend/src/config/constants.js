// frontend/src/config/constants.js
export const PAGINATION = {
  MESSAGES_PER_PAGE: 50,
  CONTACTS_PER_PAGE: 20,
  CHATS_PER_PAGE: 50,
};

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
};

export const SOCKET_EVENTS = {
  NEW_MESSAGE: "new_message",
  MESSAGES_READ: "messages_read",
  USER_TYPING: "user_typing",
  USER_STOP_TYPING: "user_stop_typing",
  USER_ONLINE: "user_online",
  USER_OFFLINE: "user_offline",
  ONLINE_USERS: "online_users",
  MARK_READ: "mark_read",
  TYPING: "typing",
  STOP_TYPING: "stop_typing",
};
