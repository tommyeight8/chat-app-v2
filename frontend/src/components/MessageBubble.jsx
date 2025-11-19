// frontend/src/components/MessageBubble.jsx (ENHANCED)
import { useState } from "react";
import { formatMessageTime } from "../utils/dateUtils";
import ImageModal from "./ImageModal";

const MessageBubble = ({ message, isOwnMessage, senderName, senderAvatar }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <>
      <div className="flex items-start gap-3 py-2 px-2 -mx-2 rounded-lg transition-colors">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {senderAvatar ? (
            <img
              src={senderAvatar}
              alt={senderName}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-semibold text-sm">
              {senderName?.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Name and Time */}
          <div className="flex items-baseline gap-2 mb-1">
            <span
              className={`text-sm font-semibold ${
                isOwnMessage ? "text-primary" : "text-theme"
              }`}
            >
              {senderName}
            </span>
            <span className="text-xs text-theme-tertiary">
              {formatMessageTime(message.createdAt)}
            </span>
          </div>

          {/* Message Text/Image */}
          <div className="text-sm text-theme">
            {message.image ? (
              <div className="space-y-2">
                {/* Image with Loading State */}
                <div className="relative max-w-sm">
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}

                  {imageError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <p className="text-sm text-red-600">
                        Failed to load image
                      </p>
                    </div>
                  ) : (
                    <img
                      src={message.image}
                      alt="Shared image"
                      className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity border border-theme"
                      onClick={() => setShowImageModal(true)}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      loading="lazy"
                    />
                  )}
                </div>

                {message.text && (
                  <p className="break-words whitespace-pre-wrap">
                    {message.text}
                  </p>
                )}
              </div>
            ) : (
              <p className="break-words whitespace-pre-wrap">{message.text}</p>
            )}
          </div>

          {/* Read Status (for own messages) */}
          {isOwnMessage && (
            <div className="mt-1 flex items-center gap-1">
              <span className="text-xs">
                {message.read ? (
                  <span className="text-primary flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                      <path d="M11.854 1.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-1-1a.5.5 0 0 1 .708-.708l.646.647 6.646-6.647a.5.5 0 0 1 .708 0z" />
                    </svg>
                    Read
                  </span>
                ) : (
                  <span className="text-theme-tertiary flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                    >
                      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                    </svg>
                    Sent
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <ImageModal
          imageUrl={message.image}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </>
  );
};

export default MessageBubble;
