import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { searchWebSources } from "../controllers/searchController.js";

const router = Router();

router.use(authMiddleware);
router.post("/web", searchWebSources);

export default router;
