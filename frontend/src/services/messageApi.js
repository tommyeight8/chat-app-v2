import api from "./api";

export const messageAPI = {
  // Get all contacts (all users)
  getAllContacts: async () => {
    const response = await api.get("/messages/contacts");
    return response.data;
  },

  // Get chat partners (users you've messaged)
  getChatPartners: async () => {
    const response = await api.get("/messages/chats");
    return response.data;
  },

  // Get messages with specific user
  getMessages: async (userId) => {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
  },

  // Send text message
  sendMessage: async (receiverId, text) => {
    const response = await api.post("/messages/send", {
      receiverId,
      text,
    });
    return response.data;
  },

  // Send image message
  sendImageMessage: async (receiverId, imageFile) => {
    const formData = new FormData();
    formData.append("receiverId", receiverId);
    formData.append("image", imageFile);

    const response = await api.post("/messages/send-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default messageAPI;
