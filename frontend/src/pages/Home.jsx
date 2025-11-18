// frontend/src/pages/Home.jsx
// Using LCH Gradient Classes + Glassmorphism

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMessages } from "../context/MessageContext";
import "../styles/glassmorphic.css";
import "../styles/gradients.css";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { chats } = useMessages();

  const totalChats = chats.length;
  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  // ================================
  // LANDING PAGE (Not logged in)
  // ================================
  if (!user) {
    return (
      <div className="relative h-full overflow-hidden gradient-violet-slate-teal-animated">
        {/* Animated background blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        {/* Content */}
        <div className="relative h-full flex items-center justify-center px-4">
          <div className="text-center">
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-3xl p-12 shadow-2xl">
              <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
                Chatty
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-md">
                Connect instantly — beautiful, secure, real-time messaging
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-2 text-sm bg-white text-gray-600 rounded-lg font-semibold hover:bg-white/90 transition-all shadow hover:scale-105"
                >
                  Login
                </button>

                <button
                  onClick={() => navigate("/signup")}
                  className="px-6 py-2 text-sm bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/30 transition-all shadow hover:scale-105"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================================
  // DASHBOARD (Logged in)
  // ================================
  return (
    <div className="relative h-full overflow-auto gradient-violet-slate-teal-light">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-1">
            Welcome back, {user.fullname.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-700">
            Here’s what’s happening with your messages today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <StatCard
            value={totalChats}
            label="Active Conversations"
            emoji="💬"
            color="blue"
          />
          <StatCard
            value={totalUnread}
            label="Unread Messages"
            emoji="📨"
            color="green"
          />
          <div
            onClick={() => navigate("/messages")}
            className="cursor-pointer backdrop-blur-xl bg-white/60 border border-white/40 p-6 rounded-2xl shadow hover:shadow-lg transition"
          >
            <div className="text-purple-600 text-3xl mb-2">➕</div>
            <h3 className="text-xl font-semibold">New Message</h3>
            <p className="text-gray-600 text-sm">Start a conversation</p>
          </div>
        </div>

        {/* Recent Chats */}
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Conversations
            </h2>
            <button
              onClick={() => navigate("/messages")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All →
            </button>
          </div>

          {chats.length === 0 ? (
            <div className="p-12 text-center text-gray-600">
              <div className="text-4xl mb-3">💬</div>
              No messages yet — start chatting!
            </div>
          ) : (
            <div className="divide-y">
              {chats.slice(0, 5).map((chat) => (
                <button
                  key={chat._id}
                  onClick={() => navigate(`/messages/${chat.user._id}`)} // ← FIXED DUPLICATE ISSUE
                  className="w-full p-5 flex items-center hover:bg-gray-50 transition text-left"
                >
                  {/* Avatar */}
                  {chat.user.avatar ? (
                    <img
                      src={chat.user.avatar}
                      alt={chat.user.fullname}
                      className="w-12 h-12 rounded-full object-cover shadow"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                      {chat.user.fullname.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900 truncate">
                        {chat.user.fullname}
                      </span>
                      {chat.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>

                    <span className="text-sm text-gray-600 truncate block">
                      {chat.lastMessage?.image
                        ? "📷 Photo"
                        : chat.lastMessage?.text}
                    </span>
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

// 🔹 Stat Card Component
const StatCard = ({ value, label, emoji, color }) => (
  <div className="backdrop-blur-xl bg-white/60 border border-white/40 p-6 rounded-2xl shadow hover:shadow-lg transition">
    <div className={`text-${color}-600 text-3xl mb-2`}>{emoji}</div>
    <h3 className="text-3xl font-bold">{value}</h3>
    <p className="text-gray-600">{label}</p>
  </div>
);

export default Home;
