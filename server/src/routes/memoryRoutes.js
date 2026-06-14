import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createMemory,
  deleteMemory,
  getMemoryById,
  getMemories,
  restoreMemory,
  updateMemory,
} from "../controllers/memoryController.js";

const router = Router();

router.use(authMiddleware);
router.post("/", createMemory);
router.get("/", getMemories);
router.get("/:id", getMemoryById);
router.put("/:id", updateMemory);
router.delete("/:id", deleteMemory);
router.patch("/:id/restore", restoreMemory);

export default router;
