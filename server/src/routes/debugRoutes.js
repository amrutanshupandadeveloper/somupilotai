import { Router } from "express";
import {
  getAiDebugConfig,
  testProviderConnection,
} from "../controllers/debugController.js";

const router = Router();

router.get("/ai-config", getAiDebugConfig);
router.get("/test-openrouter", testProviderConnection);
router.get("/test-provider/:provider", testProviderConnection);

export default router;
