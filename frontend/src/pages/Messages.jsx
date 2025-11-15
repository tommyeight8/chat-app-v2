import { useEffect, useState } from "react";
import { useMessages } from "../context/MessageContext";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import ContactList from "../components/ContactList";

const Messages = () => {
  const { loadChats, loadContacts, currentChat } = useMessages();
  const [showContacts, setShowContacts] = useState(false);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleNewChat = () => {
    setShowContacts(true);
    loadContacts();
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar - Chat List */}
      <div
        className={`w-full md:w-96 bg-white border-r border-gray-200 flex flex-col ${
          currentChat ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          <button
            onClick={handleNewChat}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            New Chat
          </button>
        </div>

        {/* Chat List or Contact List */}
        {showContacts ? (
          <ContactList onClose={() => setShowContacts(false)} />
        ) : (
          <ChatList />
        )}
      </div>

      {/* Main Chat Window */}
      <div className={`flex-1 ${currentChat ? "flex" : "hidden md:flex"}`}>
        {currentChat ? (
          <ChatWindow />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Select a chat to start messaging
              </h2>
              <p className="text-gray-600">
                Choose a conversation from the list or start a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
