import asyncHandler from "../utils/asyncHandler.js";
import createHttpError from "../utils/createHttpError.js";
import { sendSuccess } from "../utils/response.js";
import { searchWeb } from "../services/webSearch.service.js";

const searchWebSources = asyncHandler(async (req, res) => {
  const query = String(req.body?.query || "").trim();

  if (!query) {
    throw createHttpError(400, "Search query is required");
  }

  const result = await searchWeb(query);

  return sendSuccess(res, result.message, {
    sources: result.sources || [],
    configured: result.success,
  });
});

export { searchWebSources };
