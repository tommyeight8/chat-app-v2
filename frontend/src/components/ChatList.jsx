import { useMessages } from "../context/MessageContext";
import { formatDistanceToNow } from "../utils/dateUtils";

const ChatList = () => {
  const { chats, loading, selectChat, currentChat } = useMessages();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-gray-600">No conversations yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Start a new chat to begin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {chats.map((chat) => {
        const isActive = currentChat?._id === chat.user._id;
        const hasUnread = chat.unreadCount > 0;

        return (
          <button
            key={chat._id}
            onClick={() => selectChat(chat.user)}
            className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
              isActive ? "bg-blue-50 hover:bg-blue-50" : ""
            }`}
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {chat.user.avatar ? (
                <img
                  src={chat.user.avatar}
                  alt={chat.user.fullname}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {chat.user.fullname.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <h3
                  className={`font-semibold truncate ${
                    hasUnread ? "text-gray-900" : "text-gray-700"
                  }`}
                >
                  {chat.user.fullname}
                </h3>
                {chat.lastMessage && (
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatDistanceToNow(chat.lastMessage.createdAt)}
                  </span>
                )}
              </div>

              {/* Last Message Preview */}
              {chat.lastMessage && (
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm truncate ${
                      hasUnread ? "font-medium text-gray-900" : "text-gray-600"
                    }`}
                  >
                    {chat.lastMessage.image
                      ? "📷 Photo"
                      : chat.lastMessage.text}
                  </p>
                  {hasUnread && (
                    <span className="ml-2 flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                      {chat.unreadCount}
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

export default ChatList;
