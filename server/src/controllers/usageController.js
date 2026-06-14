import asyncHandler from "../utils/asyncHandler.js";
import createHttpError from "../utils/createHttpError.js";
import { sendSuccess } from "../utils/response.js";
import {
  resetCreditsIfNeeded,
  resetUsageForDevelopment,
  sanitizeUsage,
} from "../services/usage.service.js";

const getUsage = asyncHandler(async (req, res) => {
  const usage = await resetCreditsIfNeeded(req.user._id);

  return sendSuccess(res, "Usage fetched successfully", sanitizeUsage(usage));
});

const resetUsageDev = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    throw createHttpError(404, "Route not found");
  }

  const usage = await resetUsageForDevelopment(req.user._id);

  return sendSuccess(res, "Usage reset successfully", sanitizeUsage(usage));
});

export { getUsage, resetUsageDev };
