// frontend/src/components/ChatList.jsx (ENHANCED)
import React from "react";
import { useMessages } from "../context/MessageContext";
import { formatDistanceToNow } from "../utils/dateUtils";

const ChatList = () => {
  const { chats, loading, selectChat, currentChat, isUserOnline } =
    useMessages();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-theme-secondary">No conversations yet</p>
          <p className="text-sm text-theme-tertiary mt-1">
            Start a new chat to begin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-theme">
      {chats.map((chat) => {
        const isActive = currentChat?._id === chat.user._id;
        const hasUnread = chat.unreadCount > 0;
        const userOnline = isUserOnline(chat.user._id); // ✅ NEW

        return (
          <button
            key={chat._id}
            onClick={() => selectChat(chat.user)}
            className={`w-full p-4 flex items-start gap-3 hover:bg-sidebar-hover transition-colors border-b border-theme ${
              isActive ? "bg-sidebar-active hover:bg-sidebar-active" : ""
            }`}
          >
            {/* Avatar with Online Indicator */}
            <div className="flex-shrink-0 relative">
              {chat.user.avatar ? (
                <img
                  src={chat.user.avatar}
                  alt={chat.user.fullname}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  {chat.user.fullname.charAt(0).toUpperCase()}
                </div>
              )}

              {/* ✅ Online Status Indicator */}
              {userOnline && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[var(--color-online)] border-2 border-white rounded-full"></div>
              )}
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0 text-left">
              {/* Name and Time */}
              <div className="flex items-center justify-between mb-1">
                <h3
                  className={`font-semibold truncate ${
                    hasUnread ? "text-theme" : "text-theme-secondary"
                  }`}
                >
                  {chat.user.fullname}
                </h3>
                {chat.lastMessage && (
                  <span className="text-xs text-theme-tertiary flex-shrink-0 ml-2">
                    {formatDistanceToNow(chat.lastMessage.createdAt)}
                  </span>
                )}
              </div>

              {/* Last Message Preview */}
              {chat.lastMessage && (
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm flex-1 min-w-0 truncate ${
                      hasUnread
                        ? "font-medium text-theme"
                        : "text-theme-secondary"
                    }`}
                  >
                    {chat.lastMessage.image ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 inline"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Photo
                      </span>
                    ) : (
                      <span className="truncate">{chat.lastMessage.text}</span>
                    )}
                  </p>

                  {hasUnread && (
                    <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                    </span>
                  )}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default React.memo(ChatList);
