import { Router } from "express";
import rateLimit from "express-rate-limit";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  deleteConversation,
  getConversation,
  getConversations,
  sendMessage,
  updateConversationTitle,
} from "../controllers/chatController.js";

const router = Router();
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many chat requests. Please slow down for a moment.",
  },
});

router.use(authMiddleware);
router.post("/", chatLimiter, sendMessage);
router.get("/conversations", getConversations);
router.get("/conversations/:id", getConversation);
router.delete("/conversations/:id", deleteConversation);
router.patch("/conversations/:id/title", updateConversationTitle);

export default router;
