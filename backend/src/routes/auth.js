import express from "express";
import {
  signUpController,
  logout,
  login,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { upload } from "../../middleware/multer.js";
import { createRateLimitMiddleware } from "../../middleware/rateLimitMiddleware.js";
import { ajAuth, ajProfile } from "../lib/arcjet.js";

const router = express.Router();

// Create middleware instances
const authRateLimit = createRateLimitMiddleware(ajAuth);
const profileRateLimit = createRateLimitMiddleware(ajProfile);

// Public routes with strict protection
router.post("/signup", authRateLimit, signUpController);
router.post("/login", authRateLimit, login);
router.post("/logout", logout);

// Protected routes
router.put(
  "/update-profile",
  protect,
  profileRateLimit,
  upload.single("avatar"),
  updateProfile
);

export default router;
