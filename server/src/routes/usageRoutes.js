import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getUsage, resetUsageDev } from "../controllers/usageController.js";

const router = Router();

router.use(authMiddleware);
router.get("/", getUsage);
router.post("/reset-dev", resetUsageDev);

export default router;
