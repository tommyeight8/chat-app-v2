import express from "express";
import {
  sendMessage,
  sendImageMessage,
  getAllContacts,
  getChatPartners,
  getMessages,
} from "../controllers/messageController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { upload } from "../../middleware/multer.js";
import { createRateLimitMiddleware } from "../../middleware/rateLimitMiddleware.js";
import { ajGeneral } from "../lib/arcjet.js";

const router = express.Router();
const messageRateLimit = createRateLimitMiddleware(ajGeneral);

// All routes protected
router.use(protect);
router.use(messageRateLimit);

// Get all contacts (all users)
router.get("/contacts", getAllContacts);

// Get chat partners (users you've messaged)
router.get("/chats", getChatPartners);

// Get messages with specific user
router.get("/:id", getMessages);

// Send text message
router.post("/send", sendMessage);

// Send image message
router.post("/send-image", upload.single("image"), sendImageMessage);

export default router;
