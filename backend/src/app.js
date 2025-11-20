import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/message.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { initializeSocket } from "./socket/socketHandler.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const __dirname = path.resolve();
const PORT = ENV.PORT || 3000;

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin:
      ENV.NODE_ENV === "development"
        ? "http://localhost:5173"
        : ENV.FRONTEND_URL,
    credentials: true,
  })
);

app.use(compression());

if (ENV.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

app.set("trust proxy", 1);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many API requests, please slow down",
});

initializeSocket(httpServer);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("/api/auth", apiLimiter, authRoutes);
app.use("/api/messages", apiLimiter, messageRoutes);

if (ENV.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

app.use((err, req, res, next) => {
  const message =
    ENV.NODE_ENV === "production" ? "Internal server error" : err.message;
  res.status(err.status || 500).json({
    success: false,
    message,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const gracefulShutdown = async (signal) => {
  httpServer.close(async () => {
    try {
      await connectDB().then((conn) => conn.connection.close());
    } catch (err) {}
    process.exit(0);
  });

  setTimeout(() => {
    process.exit(1);
  }, 30000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

httpServer.listen(PORT, "0.0.0.0", () => {
  connectDB();
});

process.on("unhandledRejection", (err) => {
  gracefulShutdown("UNHANDLED_REJECTION");
});

process.on("uncaughtException", (err) => {
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});
