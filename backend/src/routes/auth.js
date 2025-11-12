import express from "express";
import {
  signUpController,
  logout,
  login,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { upload } from "../../middleware/multer.js";

const router = express.Router();

router.post("/signup", signUpController);

router.post("/login", login);

router.post("/logout", logout);

router.put("/update-profile", protect, upload.single("avatar"), updateProfile);

router.get("/check", protect, (req, res) => {
  res.status(200).json(req.user);
});

export default router;
