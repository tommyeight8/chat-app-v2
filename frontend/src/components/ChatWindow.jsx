// frontend/src/components/ChatWindow.jsx (UPDATED WITH TYPING & ONLINE STATUS)
// Replace your existing ChatWindow.jsx with this

import { useEffect, useRef } from "react";
import { useMessages } from "../context/MessageContext";
import { useAuth } from "../context/AuthContext";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

const ChatWindow = () => {
  const {
    currentChat,
    messages,
    loading,
    clearCurrentChat,
    isTyping,
    isUserOnline,
  } = useMessages();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!currentChat) return null;

  const userOnline = isUserOnline(currentChat._id);

  return (
    <div className="flex-1 flex flex-col bg-white h-screen">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white flex-shrink-0">
        {/* Back button for mobile */}
        <button
          onClick={clearCurrentChat}
          className="md:hidden text-gray-600 hover:text-gray-900"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* User Avatar with Online Indicator */}
        <div className="relative">
          {currentChat.avatar ? (
            <img
              src={currentChat.avatar}
              alt={currentChat.fullname}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {currentChat.fullname.charAt(0).toUpperCase()}
            </div>
          )}
          {/* Online Status Dot */}
          {userOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>

        {/* User Info */}
        <div>
          <h2 className="font-semibold text-gray-900">
            {currentChat.fullname}
          </h2>
          <p className="text-sm text-gray-600">
            {userOnline ? (
              <span className="text-green-600">Online</span>
            ) : (
              <span className="text-gray-500">Offline</span>
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-2">👋</div>
              <p className="text-gray-600">No messages yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Send a message to start the conversation
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              isOwnMessage={message.senderId === user?.id}
            />
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0">
        <MessageInput receiverId={currentChat._id} />
      </div>
    </div>
  );
};

export default ChatWindow;
