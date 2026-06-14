import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  getAdminAiStatus,
  getAdminStats,
  getAdminUsageOverview,
  getAdminUsers,
  getAuditLogs,
  resetUserCredits,
  updateUserCredits,
  updateUserRole,
  updateUserStatus,
} from "../controllers/adminController.js";

const router = Router();

router.use(authMiddleware);
router.use(requireAdmin);

router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/credits", updateUserCredits);
router.post("/users/:id/reset-credits", resetUserCredits);
router.get("/usage", getAdminUsageOverview);
router.get("/ai-status", getAdminAiStatus);
router.get("/audit-logs", getAuditLogs);

export default router;
