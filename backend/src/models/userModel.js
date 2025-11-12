import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" }, // Cloudinary URL
    avatarPublicId: { type: String, default: "" }, // For deletion
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
