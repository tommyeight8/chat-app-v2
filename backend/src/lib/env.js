import "dotenv/config";

export const ENV = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/chat-app",
  JWT_SECRET: process.env.JWT_SECRET || "changeme",

  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM || "noreply@example.com",
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || "Chat App",

  APP_NAME: process.env.APP_NAME || "Chat App",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_SECRET: process.env.CLOUDINARY_SECRET,
};
