// frontend/src/components/Header.jsx
// Responsive Header with Navigation

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useMessages } from "../context/MessageContext";

const Header = () => {
  const { user, logout } = useAuth();
  const { chats } = useMessages();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Calculate total unread messages
  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  console.log(user);

  const handleLogout = async () => {
    await logout();
    setProfileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">ChatApp</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <a
                href="/messages"
                className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-blue-500 text-sm font-medium"
              >
                Messages
                {totalUnread > 0 && (
                  <span className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </a>
              <a
                href="/contacts"
                className="text-gray-600 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium transition-colors"
              >
                Contacts
              </a>
            </nav>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.fullname}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {user?.fullname?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden lg:block text-gray-900 font-medium">
                  {user?.fullname}
                </span>
                <svg
                  className={`hidden lg:block w-4 h-4 text-gray-600 transition-transform ${
                    profileMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileMenuOpen(false)}
                  ></div>

                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.fullname}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Your Profile
                    </a>
                    <a
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Settings
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="pt-2 pb-3 space-y-1">
            <a
              href="/"
              className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center justify-between">
                <span>Messages</span>
                {totalUnread > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </div>
            </a>
            <a
              href="/contacts"
              className="border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 block pl-3 pr-4 py-2 text-base font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contacts
            </a>
          </div>

          {/* Mobile User Menu */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.fullname}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  {user?.fullname?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="ml-3">
                <div className="text-base font-medium text-gray-900">
                  {user?.fullname}
                </div>
                <div className="text-sm text-gray-600">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <a
                href="/profile"
                className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Your Profile
              </a>
              <a
                href="/settings"
                className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </a>
              <button
                onClick={handleLogout}
                className="w-full text-left block px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
