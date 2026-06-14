import User from "../models/User.js";
import Usage, { getNextResetAt, getResetDateKey } from "../models/Usage.js";
import Conversation from "../models/Conversation.js";
import Note from "../models/Note.js";
import Task from "../models/Task.js";
import Memory from "../models/Memory.js";
import Document from "../models/Document.js";
import AuditLog from "../models/AuditLog.js";
import asyncHandler from "../utils/asyncHandler.js";
import createHttpError from "../utils/createHttpError.js";
import { sendSuccess } from "../utils/response.js";
import { getProviderStatus } from "../services/aiProvider.service.js";
import { getOrCreateUsage } from "../services/usage.service.js";

const ADMIN_USER_FIELDS = "name email role status avatarUrl createdAt updatedAt lastLoginAt";
const ALLOWED_ROLES = ["user", "admin"];
const ALLOWED_STATUSES = ["active", "blocked"];
const CREDIT_FIELDS = [
  "maxAiCredits",
  "aiCredits",
  "maxDocumentCredits",
  "documentCredits",
  "resetIntervalHours",
  "maxPdfUploadsPerDay",
];

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const sanitizeManagedUser = (user, usage) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status || "active",
  avatarUrl: user.avatarUrl || "",
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  lastLoginAt: user.lastLoginAt || null,
  usage: usage
    ? {
        aiCredits: usage.aiCredits,
        maxAiCredits: usage.maxAiCredits,
        documentCredits: usage.documentCredits,
        maxDocumentCredits: usage.maxDocumentCredits,
        pdfUploadsToday: usage.pdfUploadsToday,
        maxPdfUploadsPerDay: usage.maxPdfUploadsPerDay,
        pictureUploadsToday: usage.pictureUploadsToday,
        maxPictureUploadsPerDay: usage.maxPictureUploadsPerDay,
        videoUploadsToday: usage.videoUploadsToday,
        maxVideoUploadsPerDay: usage.maxVideoUploadsPerDay,
        resetIntervalHours: usage.resetIntervalHours,
        nextResetAt: usage.nextResetAt,
      }
    : null,
});

const logAdminAction = async ({ adminId, action, targetType, targetId, metadata = {} }) => {
  await AuditLog.create({
    adminId,
    action,
    targetType,
    targetId,
    metadata,
  });
};

const loadUsersWithUsage = async (users) => {
  const usages = await Usage.find({
    userId: { $in: users.map((user) => user._id) },
  });
  const usageMap = new Map(usages.map((usage) => [usage.userId.toString(), usage]));

  return Promise.all(
    users.map(async (user) => {
      const usage = usageMap.get(user._id.toString()) || (await getOrCreateUsage(user._id));
      return sanitizeManagedUser(user, usage);
    })
  );
};

const getAdminStats = asyncHandler(async (_req, res) => {
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const [
    totalUsers,
    activeUsers,
    totalConversations,
    totalNotes,
    totalTasks,
    totalMemories,
    totalDocuments,
    usersCreatedLast7Days,
    documentsUploadedLast7Days,
    recentUsers,
    aiUsageAggregate,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({
      $or: [{ status: "active" }, { status: { $exists: false } }],
    }),
    Conversation.countDocuments(),
    Note.countDocuments(),
    Task.countDocuments(),
    Memory.countDocuments(),
    Document.countDocuments(),
    User.countDocuments({ createdAt: { $gte: last7Days } }),
    Document.countDocuments({ uploadedAt: { $gte: last7Days } }),
    User.find({}).select(ADMIN_USER_FIELDS).sort({ createdAt: -1 }).limit(5),
    Conversation.aggregate([
      { $unwind: "$messages" },
      {
        $match: {
          "messages.role": "assistant",
          "messages.providerUsed": { $exists: true, $ne: "" },
        },
      },
      { $count: "total" },
    ]),
  ]);

  return sendSuccess(res, "Admin stats fetched successfully", {
    totalUsers,
    activeUsers,
    totalConversations,
    totalNotes,
    totalTasks,
    totalMemories,
    totalDocuments,
    totalAiCreditsUsed: aiUsageAggregate[0]?.total || 0,
    totalDocumentQuestions: 0,
    usersCreatedLast7Days,
    documentsUploadedLast7Days,
    recentUsers: await loadUsersWithUsage(recentUsers),
  });
});

const getAdminUsers = asyncHandler(async (req, res) => {
  const page = parsePositiveInt(req.query.page, 1);
  const limit = Math.min(parsePositiveInt(req.query.limit, 10), 50);
  const skip = (page - 1) * limit;
  const search = String(req.query.search || "").trim();
  const role = String(req.query.role || "").trim().toLowerCase();
  const status = String(req.query.status || "").trim().toLowerCase();

  const query = {};
  const andConditions = [];

  if (search) {
    andConditions.push({
      $or: [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      ],
    });
  }

  if (ALLOWED_ROLES.includes(role)) {
    andConditions.push({ role });
  }

  if (status === "active") {
    andConditions.push({
      $or: [{ status: "active" }, { status: { $exists: false } }],
    });
  } else if (status === "blocked") {
    andConditions.push({ status: "blocked" });
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }

  const [users, total] = await Promise.all([
    User.find(query).select(ADMIN_USER_FIELDS).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  return sendSuccess(res, "Admin users fetched successfully", {
    items: await loadUsersWithUsage(users),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
    filters: {
      search,
      role: role || "all",
      status: status || "all",
    },
  });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const nextRole = String(req.body?.role || "").trim().toLowerCase();

  if (!ALLOWED_ROLES.includes(nextRole)) {
    throw createHttpError(400, "Role must be either user or admin");
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  user.role = nextRole;
  await user.save();
  const usage = await getOrCreateUsage(user._id);

  await logAdminAction({
    adminId: req.user._id,
    action: "user.role.updated",
    targetType: "user",
    targetId: user._id,
    metadata: { role: nextRole },
  });

  return sendSuccess(res, "User role updated successfully", sanitizeManagedUser(user, usage));
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const nextStatus = String(req.body?.status || "").trim().toLowerCase();

  if (!ALLOWED_STATUSES.includes(nextStatus)) {
    throw createHttpError(400, "Status must be either active or blocked");
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  user.status = nextStatus;
  await user.save();
  const usage = await getOrCreateUsage(user._id);

  await logAdminAction({
    adminId: req.user._id,
    action: "user.status.updated",
    targetType: "user",
    targetId: user._id,
    metadata: { status: nextStatus },
  });

  return sendSuccess(res, "User status updated successfully", sanitizeManagedUser(user, usage));
});

const updateUserCredits = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(ADMIN_USER_FIELDS);

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  const usage = await getOrCreateUsage(user._id);
  const updates = {};

  for (const field of CREDIT_FIELDS) {
    const rawValue = req.body?.[field];

    if (rawValue === undefined || rawValue === null || rawValue === "") {
      continue;
    }

    const parsedValue = Number(rawValue);

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      throw createHttpError(400, `Invalid value for ${field}`);
    }

    updates[field] = parsedValue;
  }

  if (Object.keys(updates).length === 0) {
    throw createHttpError(400, "At least one credit field is required");
  }

  if (updates.maxAiCredits !== undefined && updates.maxAiCredits < 1) {
    throw createHttpError(400, "maxAiCredits must be at least 1");
  }

  if (updates.maxDocumentCredits !== undefined && updates.maxDocumentCredits < 1) {
    throw createHttpError(400, "maxDocumentCredits must be at least 1");
  }

  if (updates.resetIntervalHours !== undefined && updates.resetIntervalHours < 1) {
    throw createHttpError(400, "resetIntervalHours must be at least 1");
  }

  if (updates.maxPdfUploadsPerDay !== undefined && updates.maxPdfUploadsPerDay < 1) {
    throw createHttpError(400, "maxPdfUploadsPerDay must be at least 1");
  }

  Object.assign(usage, updates);

  if (usage.aiCredits > usage.maxAiCredits) {
    usage.aiCredits = usage.maxAiCredits;
  }

  if (usage.documentCredits > usage.maxDocumentCredits) {
    usage.documentCredits = usage.maxDocumentCredits;
  }

  await usage.save();

  await logAdminAction({
    adminId: req.user._id,
    action: "user.credits.updated",
    targetType: "user",
    targetId: user._id,
    metadata: updates,
  });

  return sendSuccess(res, "User credits updated successfully", sanitizeManagedUser(user, usage));
});

const resetUserCredits = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(ADMIN_USER_FIELDS);

  if (!user) {
    throw createHttpError(404, "User not found");
  }

  const usage = await getOrCreateUsage(user._id);
  usage.aiCredits = usage.maxAiCredits;
  usage.documentCredits = usage.maxDocumentCredits;
  usage.pdfUploadsToday = 0;
  usage.pictureUploadsToday = 0;
  usage.videoUploadsToday = 0;
  usage.lastResetAt = new Date();
  usage.nextResetAt = getNextResetAt(usage.resetIntervalHours);
  usage.lastPdfResetDate = getResetDateKey();
  usage.lastMediaResetDate = getResetDateKey();
  await usage.save();

  await logAdminAction({
    adminId: req.user._id,
    action: "user.credits.reset",
    targetType: "user",
    targetId: user._id,
    metadata: { resetAt: usage.lastResetAt },
  });

  return sendSuccess(res, "User credits reset successfully", sanitizeManagedUser(user, usage));
});

const getAdminAiStatus = asyncHandler(async (_req, res) => {
  const providerStatus = getProviderStatus();

  return sendSuccess(res, "Admin AI provider status fetched successfully", {
    aiProvider: providerStatus.mode,
    fallbackProviders: providerStatus.fallbackOrder,
    providers: providerStatus.providers,
  });
});

const getAuditLogs = asyncHandler(async (req, res) => {
  const page = parsePositiveInt(req.query.page, 1);
  const limit = Math.min(parsePositiveInt(req.query.limit, 20), 50);
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find({})
      .populate("adminId", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(),
  ]);

  return sendSuccess(res, "Audit logs fetched successfully", {
    items: logs.map((log) => ({
      id: log._id.toString(),
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId.toString(),
      metadata: log.metadata || {},
      createdAt: log.createdAt,
      admin: log.adminId
        ? {
            id: log.adminId._id.toString(),
            name: log.adminId.name,
            email: log.adminId.email,
            role: log.adminId.role,
          }
        : null,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

const getAdminUsageOverview = asyncHandler(async (_req, res) => {
  const users = await User.find({}).select(ADMIN_USER_FIELDS).sort({ createdAt: -1 });
  const items = await loadUsersWithUsage(users);

  return sendSuccess(res, "Admin usage overview fetched successfully", {
    items,
    lowAiCreditUsers: items.filter((item) => item.usage && item.usage.aiCredits <= 5),
    zeroAiCreditUsers: items.filter((item) => item.usage && item.usage.aiCredits === 0),
  });
});

export {
  getAdminAiStatus,
  getAdminStats,
  getAdminUsageOverview,
  getAdminUsers,
  getAuditLogs,
  resetUserCredits,
  updateUserCredits,
  updateUserRole,
  updateUserStatus,
};
