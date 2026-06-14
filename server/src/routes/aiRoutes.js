import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getAiStatus } from "../controllers/aiController.js";

const router = Router();

router.use(authMiddleware);
router.get("/status", getAiStatus);

export default router;
