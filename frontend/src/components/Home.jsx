// frontend/src/pages/Home.jsx
// Home page - Header is handled by Layout

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMessages } from "../context/MessageContext";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { chats } = useMessages();

  // Calculate stats
  const totalChats = chats.length;
  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  // If not logged in, show landing page
  if (!user) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 className="text-5xl font-bold mb-4">💬 ChatApp</h1>
          <p className="text-xl mb-8">
            Connect with friends and family instantly
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If logged in, show dashboard
  return (
    <div className="h-full overflow-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Home back, {user.fullname}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your messages today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Conversations */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {totalChats}
                </h3>
                <p className="text-sm text-gray-600">Active Conversations</p>
              </div>
            </div>
          </div>

          {/* Unread Messages */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {totalUnread}
                </h3>
                <p className="text-sm text-gray-600">Unread Messages</p>
              </div>
            </div>
          </div>

          {/* Quick Action */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <button
                  onClick={() => navigate("/messages")}
                  className="text-lg font-semibold text-purple-600 hover:text-purple-700"
                >
                  New Message
                </button>
                <p className="text-sm text-gray-600">Start a conversation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Chats */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Conversations
            </h2>
            <button
              onClick={() => navigate("/messages")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>

          {chats.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start chatting with friends and family
              </p>
              <button
                onClick={() => navigate("/messages")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Chatting
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {chats.slice(0, 5).map((chat) => (
                <button
                  key={chat._id}
                  onClick={() => navigate("/messages")}
                  className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors text-left"
                >
                  {/* Avatar */}
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

                  {/* Chat Info */}
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {chat.user.fullname}
                      </h3>
                      {chat.unreadCount > 0 && (
                        <span className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage.image
                          ? "📷 Photo"
                          : chat.lastMessage.text}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
