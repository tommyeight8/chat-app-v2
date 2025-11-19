// frontend/src/components/MessageInput.jsx (FINAL FIXED)
import { useState, useRef, useEffect, useCallback } from "react";
import { useMessages } from "../context/MessageContext";
import { FILE_UPLOAD } from "../config/constants";

const MessageInput = ({ receiverId }) => {
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [sending, setSending] = useState(false);

  const fileInputRef = useRef(null);

  // Typing indicator state
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const keystrokeCountRef = useRef(0);

  const { sendMessage, sendImageMessage, emitTyping, emitStopTyping, error } =
    useMessages();

  const TYPING_THRESHOLD = 15;
  const TYPING_TIMEOUT = 2000;

  // 🎯 FIX: Only revoke preview on demand (not during onChange)
  const handleRemoveImage = useCallback(() => {
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
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTypingRef.current) emitStopTyping();
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [emitStopTyping, imagePreview]);

  // Reset when user switches chat
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        emitStopTyping();
      }
      // ✅ Clean up blob URL only on unmount
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ Empty deps - Document 11 pattern!

  // Revoke OLD blob when selecting NEW image
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation...

    // ✅ Revoke old blob BEFORE creating new one
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const newBlobUrl = URL.createObjectURL(file);
    setSelectedImage(file);
    setImagePreview(newBlobUrl);
  };

  // Typing handler
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    const nonWhitespaceCount = newText.replace(/\s/g, "").length;
    keystrokeCountRef.current = nonWhitespaceCount;

    if (nonWhitespaceCount >= TYPING_THRESHOLD && !isTypingRef.current) {
      emitTyping();
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (isTypingRef.current) {
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping();
        isTypingRef.current = false;
        keystrokeCountRef.current = 0;
      }, TYPING_TIMEOUT);
    }
  };

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() && !selectedImage) return;
    if (sending) return;

    setSending(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTypingRef.current) {
      emitStopTyping();
      isTypingRef.current = false;
    }

    keystrokeCountRef.current = 0;

    try {
      if (selectedImage) {
        await sendImageMessage(receiverId, selectedImage, text.trim());
        handleRemoveImage();
        setText("");
      } else if (text.trim()) {
        await sendMessage(receiverId, text.trim());
        setText("");
      }
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t border-theme bg-theme">
      {error && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

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
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSend} className="p-4 flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={FILE_UPLOAD.ALLOWED_TYPES.join(",")}
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Attach Image Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 p-2 text-theme-secondary hover:text-primary hover:bg-[var(--color-primaryLight)] rounded-lg"
          disabled={sending}
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
            className="w-full px-4 py-2 bg-theme text-theme border border-theme rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none placeholder:text-theme-tertiary"
            disabled={sending}
            style={{ maxHeight: "120px" }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!text.trim() && !selectedImage) || sending}
          className="flex-shrink-0 p-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50"
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
