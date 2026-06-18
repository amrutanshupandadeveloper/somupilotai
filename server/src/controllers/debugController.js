import asyncHandler from "../utils/asyncHandler.js";
import createHttpError from "../utils/createHttpError.js";
import { sendSuccess } from "../utils/response.js";
import {
  generateAiResponse,
  getProviderCooldown,
  getProviderLabel,
  getProviderModel,
  getProviderOrder,
  isProviderConfigured,
  normalizeProviderName,
  PROVIDERS,
} from "../services/aiProvider.service.js";

const getAiDebugConfig = asyncHandler(async (_req, res) => {
  if (process.env.NODE_ENV === "production") {
    throw createHttpError(404, "Route not found");
  }

  return sendSuccess(res, "AI debug config fetched successfully", {
    AI_PROVIDER: process.env.AI_PROVIDER || "auto",
    AI_FALLBACK_PROVIDERS: getProviderOrder(),
    cooldowns: Object.fromEntries(
      PROVIDERS.map((provider) => [provider, getProviderCooldown(provider)])
    ),
    openrouterConfigured: Boolean(process.env.OPENROUTER_API_KEY),
    openrouterModel: getProviderModel("openrouter"),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    geminiModel: getProviderModel("gemini"),
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
    groqModel: getProviderModel("groq"),
    huggingfaceConfigured: Boolean(process.env.HUGGINGFACE_API_KEY),
    huggingfaceModel: getProviderModel("huggingface"),
    mistralConfigured: Boolean(process.env.MISTRAL_API_KEY),
    mistralModel: getProviderModel("mistral"),
    ollamaConfigured: true,
  });
});

const testProviderConnection = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    throw createHttpError(404, "Route not found");
  }

  const provider = normalizeProviderName(req.params.provider || "openrouter");

  if (!PROVIDERS.includes(provider)) {
    throw createHttpError(400, "Unsupported provider");
  }

  try {
    const response = await generateAiResponse({
      messages: [{ role: "user", content: "Say hello in one sentence." }],
      systemPrompt: "You are SomuPilot. Reply in one short sentence.",
      overrideProvider: provider,
    });

    return sendSuccess(res, `${getProviderLabel(provider)} test completed successfully`, {
      success: true,
      provider,
      model: response.model,
      configured: isProviderConfigured(provider),
      statusCode: 200,
      text: response.text,
      message: `${getProviderLabel(provider)} call succeeded`,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      provider,
      configured: isProviderConfigured(provider),
      model: getProviderModel(provider),
      statusCode: error.statusCode || 500,
      message: error.message || "OpenRouter test failed",
      errorType: error.data?.errorType || "unknown",
    });
  }
});

export { getAiDebugConfig, testProviderConnection };
