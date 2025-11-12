import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

// GET /api/messages/contacts - Get all users except yourself
export const getAllContacts = async (req, res) => {
  try {
    const myId = req.user._id;

    // Get all users except the logged-in user
    const contacts = await User.find({ _id: { $ne: myId } })
      .select("fullname email avatar")
      .sort({ fullname: 1 });

    res.status(200).json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.error("❌ Get contacts error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/messages/chats - Get users you've chatted with
export const getChatPartners = async (req, res) => {
  try {
    const myId = req.user._id;

    const chatPartners = await Message.aggregate([
      {
        // Match messages where I'm sender or receiver
        $match: {
          $or: [{ senderId: myId }, { receiverId: myId }],
        },
      },
      {
        // Sort by newest first
        $sort: { createdAt: -1 },
      },
      {
        // Group by the other user
        $group: {
          _id: {
            $cond: [{ $eq: ["$senderId", myId] }, "$receiverId", "$senderId"],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverId", myId] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        // Join with users collection
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        // Sort by last message time
        $sort: { "lastMessage.createdAt": -1 },
      },
      {
        $project: {
          _id: 1,
          user: {
            _id: "$user._id",
            fullname: "$user.fullname",
            email: "$user.email",
            avatar: "$user.avatar",
          },
          lastMessage: {
            _id: "$lastMessage._id",
            text: "$lastMessage.text",
            image: "$lastMessage.image",
            createdAt: "$lastMessage.createdAt",
          },
          unreadCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      chats: chatPartners,
    });
  } catch (error) {
    console.error("❌ Get chat partners error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/messages/:id - Get messages with a specific user
export const getMessages = async (req, res) => {
  try {
    const { id: otherUserId } = req.params;
    const myId = req.user._id;

    // Verify the other user exists
    const otherUser = await User.findById(otherUserId).select(
      "fullname avatar"
    );
    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all messages between these two users
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
    })
      .sort({ createdAt: 1 }) // Oldest first
      .lean();

    // Optional: Mark messages as read
    await Message.updateMany(
      {
        senderId: otherUserId,
        receiverId: myId,
        read: false,
      },
      {
        $set: { read: true },
      }
    );

    res.status(200).json({
      success: true,
      messages,
      user: otherUser,
    });
  } catch (error) {
    console.error("❌ Get messages error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    if (!text && !req.file) {
      return res.status(400).json({ message: "Message content is required" });
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      text: text || "",
      read: false,
    });

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("❌ Send message error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendImageMessage = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Upload image to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, "messages");

    const message = await Message.create({
      senderId,
      receiverId,
      image: result.secure_url,
      imagePublicId: result.public_id,
    });

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("❌ Send image error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$senderId", userId] }, "$receiverId", "$senderId"],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          "userInfo.fullname": 1,
          "userInfo.avatar": 1,
          "userInfo.email": 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("❌ Get conversations error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
