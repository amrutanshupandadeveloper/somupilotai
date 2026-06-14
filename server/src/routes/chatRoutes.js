import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  deleteConversation,
  getConversation,
  getConversations,
  sendMessage,
  updateConversationTitle,
} from "../controllers/chatController.js";

const router = Router();

router.use(authMiddleware);
router.post("/", sendMessage);
router.get("/conversations", getConversations);
router.get("/conversations/:id", getConversation);
router.delete("/conversations/:id", deleteConversation);
router.patch("/conversations/:id/title", updateConversationTitle);

export default router;
