import { formatMessageTime } from "../utils/dateUtils";

const MessageBubble = ({ message, isOwnMessage }) => {
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg ${
          isOwnMessage ? "order-2" : "order-1"
        }`}
      >
        {/* Message Content */}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwnMessage
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-white text-gray-900 rounded-bl-none shadow-sm"
          }`}
        >
          {message.image ? (
            <div className="space-y-2">
              <img
                src={message.image}
                alt="Shared image"
                className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => window.open(message.image, "_blank")}
              />
              {message.text && (
                <p className="text-sm break-words">{message.text}</p>
              )}
            </div>
          ) : (
            <p className="text-sm break-words">{message.text}</p>
          )}
        </div>

        {/* Timestamp */}
        <div
          className={`flex items-center gap-1 mt-1 px-2 ${
            isOwnMessage ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-xs text-gray-500">
            {formatMessageTime(message.createdAt)}
          </span>
          {isOwnMessage && message.read && (
            <svg
              className="w-4 h-4 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
