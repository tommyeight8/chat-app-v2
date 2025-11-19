// frontend/src/components/MessageInput.jsx (CORRECTED)
import { useState, useRef, useEffect, useCallback } from "react";
import { useMessages } from "../context/MessageContext";
import { FILE_UPLOAD } from "../config/constants";

const MessageInput = ({ receiverId }) => {
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);

  // Typing indicator refs
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const keystrokeCountRef = useRef(0);

  const { sendMessage, sendImageMessage, emitTyping, emitStopTyping, error } =
    useMessages();

  // Configuration
  const TYPING_THRESHOLD = 15;
  const TYPING_TIMEOUT = 2000;

  // ✅ FIXED: Memoize handleRemoveImage
  const handleRemoveImage = useCallback(() => {
    // Revoke object URL to free memory
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [imagePreview]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        emitStopTyping();
      }
      // Clean up image preview URL
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [emitStopTyping, imagePreview]);

  // Clear form when receiver changes
  useEffect(() => {
    setText("");
    handleRemoveImage();
    keystrokeCountRef.current = 0;

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      emitStopTyping();
      isTypingRef.current = false;
    }
  }, [receiverId, handleRemoveImage, emitStopTyping]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size
    if (file.size > FILE_UPLOAD.MAX_SIZE) {
      alert(
        `Image size must be less than ${FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB`
      );
      return;
    }

    // Revoke old preview URL before creating new one
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    // Count non-whitespace characters
    const nonWhitespaceCount = newText.replace(/\s/g, "").length;
    keystrokeCountRef.current = nonWhitespaceCount;

    // Only emit typing if threshold is met
    if (keystrokeCountRef.current >= TYPING_THRESHOLD && !isTypingRef.current) {
      emitTyping();
      isTypingRef.current = true;
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send "stop typing" after inactivity
    if (isTypingRef.current) {
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping();
        isTypingRef.current = false;
        keystrokeCountRef.current = 0;
      }, TYPING_TIMEOUT);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!text.trim() && !selectedImage) return;
    if (sending) return; // Prevent double submission

    setSending(true);

    // Stop typing indicator immediately
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      emitStopTyping();
      isTypingRef.current = false;
    }
    keystrokeCountRef.current = 0;

    try {
      // Send image if present
      if (selectedImage) {
        await sendImageMessage(receiverId, selectedImage, text.trim());
        handleRemoveImage();
        setText("");
      } else if (text.trim()) {
        // Send text only
        await sendMessage(receiverId, text.trim());
        setText("");
      }
    } catch (error) {
      console.error("❌ Send message error:", error);
      // Error is handled in context and displayed in UI
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t border-theme bg-theme">
      {/* ✅ Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="p-4 border-b border-theme">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 w-20 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 flex items-end gap-2">
        {/* Image Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept={FILE_UPLOAD.ALLOWED_TYPES.join(",")}
          onChange={handleImageSelect}
          className="hidden"
          aria-label="Upload image"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-2 text-theme-secondary hover:text-primary hover:bg-[var(--color-primaryLight)] rounded-lg transition-colors"
          disabled={sending}
          aria-label="Attach image"
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
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={handleTextChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type a message..."
            rows={1}
            className="w-full px-4 py-2 bg-theme text-theme border border-theme rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none placeholder:text-theme-tertiary"
            disabled={sending}
            style={{ maxHeight: "120px" }}
            aria-label="Message input"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!text.trim() && !selectedImage) || sending}
          className="flex-shrink-0 p-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          {sending ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
