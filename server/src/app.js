import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import usageRoutes from "./routes/usageRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import tasksRoutes from "./routes/tasksRoutes.js";
import memoryRoutes from "./routes/memoryRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedLanOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return true;
    }

    if (hostname.startsWith("192.168.")) {
      return true;
    }

    if (hostname.startsWith("10.")) {
      return true;
    }

    return /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
  } catch (_error) {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || isAllowedLanOrigin(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS policy does not allow this origin"));
    },
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Welcome to SomuPilot AI API",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/usage", usageRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/memories", memoryRoutes);
app.use("/api/documents", documentRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
