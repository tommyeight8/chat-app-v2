import express from "express";
import { signUpController } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signUpController);

router.get("/login", (req, res) => {
  res.send("You are signing in!");
});

router.post("/logout", (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;
