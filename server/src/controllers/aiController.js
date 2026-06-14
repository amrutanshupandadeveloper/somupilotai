import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { getProviderStatus } from "../services/aiProvider.service.js";

const getAiStatus = asyncHandler(async (_req, res) => {
  return sendSuccess(res, "AI provider status fetched successfully", getProviderStatus());
});

export { getAiStatus };
