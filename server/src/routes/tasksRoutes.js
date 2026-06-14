import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  completeTask,
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  reopenTask,
  updateTask,
} from "../controllers/tasksController.js";

const router = Router();

router.use(authMiddleware);
router.post("/", createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.patch("/:id/complete", completeTask);
router.patch("/:id/reopen", reopenTask);

export default router;
