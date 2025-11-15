// frontend/src/pages/Home.jsx
// Using LCH Gradient Classes

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMessages } from "../context/MessageContext";
import "../styles/glassmorphic.css";
import "../styles/gradients.css"; // ← Import LCH gradients

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { chats } = useMessages();

  const totalChats = chats.length;
  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  // Landing page (not logged in)
  if (!user) {
    return (
      <div className="relative h-full overflow-hidden gradient-violet-slate-teal-animated">
        {/* ↑ Using LCH gradient class instead of Tailwind */}

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
                Connect with friends and family instantly with beautiful, secure
                messaging
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-2 text-sm bg-white text-gray-600 rounded-md font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-6 py-2 text-sm bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white rounded-md font-semibold hover:bg-white/30 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
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

  // Dashboard (logged in) - using light variant
  return (
    <div className="relative h-full overflow-auto gradient-violet-slate-teal-light">
      {/* ↑ Using LCH gradient light variant */}

      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.fullname}! 👋
          </h1>
          <p className="text-gray-700">
            Here's what's happening with your messages today
          </p>
        </div>

        {/* Stats Cards - rest of component stays the same */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* ... stat cards ... */}
        </div>

        {/* Recent Chats */}
        <div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl shadow-lg overflow-hidden">
          {/* ... chat list ... */}
        </div>
      </div>
    </div>
  );
};

export default Home;
