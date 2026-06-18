import createHttpError from "../utils/createHttpError.js";

const SYSTEM_PROMPT =
  "You are SomuPilot, a helpful personal AI assistant for productivity, learning, planning, notes, tasks, and document help. Be clear, practical, and friendly.";

const CONTEXT_MESSAGE_LIMIT = 12;
const DEFAULT_PROVIDER = "auto";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";
const DEFAULT_OPENROUTER_MODEL = "meta-llama/llama-3.2-3b-instruct:free";
const DEFAULT_HUGGINGFACE_MODEL = "HuggingFaceH4/zephyr-7b-beta";
const DEFAULT_MISTRAL_MODEL = "mistral-small-latest";
const DEFAULT_OLLAMA_MODEL = "llama3.2:3b";
const DEFAULT_OLLAMA_BASE_URL = "http://localhost:11434";
const DEFAULT_PRESET_HIGH_PROVIDER = "gemini";
const DEFAULT_PRESET_MEDIUM_PROVIDER = "groq";
const DEFAULT_PRESET_LOW_PROVIDER = "openrouter";
const REQUEST_TIMEOUT_MS = 30000;
const PROVIDERS = [
  "groq",
  "gemini",
  "openrouter",
  "huggingface",
  "mistral",
  "ollama",
];
const MODEL_PRESET_LEVELS = ["auto", "high", "medium", "low"];
const OPENROUTER_FALLBACK_MODELS = [
  "meta-llama/llama-3.2-3b-instruct:free",
  "google/gemma-3-4b-it:free",
  "qwen/qwen3-4b:free",
  "openrouter/free",
];
const providerCooldowns = new Map();

const PROVIDER_LABELS = {
  groq: "Groq",
  gemini: "Gemini",
  openrouter: "OpenRouter",
  huggingface: "Hugging Face",
  mistral: "Mistral",
  ollama: "Ollama",
};

const normalizeProviderName = (provider) => String(provider || "").trim().toLowerCase();

const normalizeModelPreset = (preset) => {
  const normalizedPreset = String(preset || "").trim().toLowerCase();
  return MODEL_PRESET_LEVELS.includes(normalizedPreset) ? normalizedPreset : "";
};

const getProviderLabel = (provider) =>
  PROVIDER_LABELS[normalizeProviderName(provider)] || "AI";

const parseRetryAfterSeconds = (value) => {
  if (!value) {
    return undefined;
  }

  const numericValue = Number(value);

  if (Number.isFinite(numericValue) && numericValue >= 0) {
    return numericValue;
  }

  const retryDate = new Date(value);

  if (Number.isNaN(retryDate.getTime())) {
    return undefined;
  }

  return Math.max(0, Math.ceil((retryDate.getTime() - Date.now()) / 1000));
};

const createNormalizedAiError = (type, userMessage, statusCode, retryAfterSeconds) => ({
  type,
  userMessage,
  statusCode,
  retryAfterSeconds,
});

const isProviderConfigured = (provider) => {
  switch (normalizeProviderName(provider)) {
    case "groq":
      return Boolean(process.env.GROQ_API_KEY);
    case "gemini":
      return Boolean(process.env.GEMINI_API_KEY);
    case "openrouter":
      return Boolean(process.env.OPENROUTER_API_KEY);
    case "huggingface":
      return Boolean(process.env.HUGGINGFACE_API_KEY);
    case "mistral":
      return Boolean(process.env.MISTRAL_API_KEY);
    case "ollama":
      return true;
    default:
      return false;
  }
};

const getProviderModel = (provider, preferredModel = "") => {
  if (preferredModel) {
    return String(preferredModel).trim();
  }

  switch (normalizeProviderName(provider)) {
    case "groq":
      return process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
    case "gemini":
      return process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
    case "openrouter":
      return process.env.OPENROUTER_MODEL || process.env.AI_MODEL || DEFAULT_OPENROUTER_MODEL;
    case "huggingface":
      return process.env.HUGGINGFACE_MODEL || DEFAULT_HUGGINGFACE_MODEL;
    case "mistral":
      return process.env.MISTRAL_MODEL || DEFAULT_MISTRAL_MODEL;
    case "ollama":
      return process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;
    default:
      return "";
  }
};

const getPresetProvider = (presetLevel) => {
  switch (normalizeModelPreset(presetLevel)) {
    case "high":
      return normalizeProviderName(
        process.env.AI_PRESET_HIGH_PROVIDER || DEFAULT_PRESET_HIGH_PROVIDER
      );
    case "medium":
      return normalizeProviderName(
        process.env.AI_PRESET_MEDIUM_PROVIDER || DEFAULT_PRESET_MEDIUM_PROVIDER
      );
    case "low":
      return normalizeProviderName(process.env.AI_PRESET_LOW_PROVIDER || DEFAULT_PRESET_LOW_PROVIDER);
    default:
      return "auto";
  }
};

const getPresetModel = (presetLevel) => {
  const normalizedPreset = normalizeModelPreset(presetLevel);

  if (!normalizedPreset || normalizedPreset === "auto") {
    return "";
  }

  const presetProvider = getPresetProvider(normalizedPreset);

  switch (normalizedPreset) {
    case "high":
      return (
        process.env.AI_PRESET_HIGH_MODEL ||
        getProviderModel(presetProvider || DEFAULT_PRESET_HIGH_PROVIDER)
      );
    case "medium":
      return (
        process.env.AI_PRESET_MEDIUM_MODEL ||
        getProviderModel(presetProvider || DEFAULT_PRESET_MEDIUM_PROVIDER)
      );
    case "low":
      return (
        process.env.AI_PRESET_LOW_MODEL ||
        getProviderModel(presetProvider || DEFAULT_PRESET_LOW_PROVIDER)
      );
    default:
      return "";
  }
};

const getPresetDescription = (presetLevel) => {
  switch (normalizeModelPreset(presetLevel)) {
    case "high":
      return "Best quality model";
    case "medium":
      return "Balanced speed and quality";
    case "low":
      return "Free/low-cost fallback";
    default:
      return "Best available provider automatically";
  }
};

const prettifyModelDisplayName = (modelName = "") =>
  String(modelName || "")
    .replace(/[:/]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getPresetConfig = (presetLevel) => {
  const normalizedPreset = normalizeModelPreset(presetLevel) || "auto";
  const provider = getPresetProvider(normalizedPreset);
  const model = getPresetModel(normalizedPreset);

  return {
    key: normalizedPreset,
    label:
      normalizedPreset === "auto"
        ? "Auto"
        : normalizedPreset.charAt(0).toUpperCase() + normalizedPreset.slice(1),
    provider,
    model,
    description: getPresetDescription(normalizedPreset),
    modelDisplayName: prettifyModelDisplayName(model),
  };
};

const getAllowedModelsForProvider = (provider) => {
  const normalizedProvider = normalizeProviderName(provider);
  const allowedModels = new Set();

  const defaultModel = getProviderModel(normalizedProvider);
  if (defaultModel) {
    allowedModels.add(defaultModel);
  }

  if (normalizedProvider === "openrouter") {
    OPENROUTER_FALLBACK_MODELS.forEach((model) => allowedModels.add(model));
  }

  ["high", "medium", "low"].forEach((presetLevel) => {
    const presetConfig = getPresetConfig(presetLevel);

    if (presetConfig.provider === normalizedProvider && presetConfig.model) {
      allowedModels.add(presetConfig.model);
    }
  });

  return Array.from(allowedModels);
};

const getSafeRequestedModel = (provider, requestedModel = "") => {
  const trimmedRequestedModel = String(requestedModel || "").trim();

  if (!trimmedRequestedModel) {
    return "";
  }

  return getAllowedModelsForProvider(provider).includes(trimmedRequestedModel)
    ? trimmedRequestedModel
    : "";
};

const setProviderCooldown = (provider, retryAfterSeconds = 60) => {
  const normalizedProvider = normalizeProviderName(provider);

  if (!normalizedProvider) {
    return;
  }

  const cooldownUntil = Date.now() + retryAfterSeconds * 1000;

  providerCooldowns.set(normalizedProvider, {
    cooldownUntil,
    retryAfterSeconds,
  });

  if (process.env.NODE_ENV === "development") {
    console.log("Provider cooldown set:", {
      provider: normalizedProvider,
      retryAfterSeconds,
      cooldownUntil,
      creditsDeducted: false,
    });
  }
};

const getProviderCooldown = (provider) => {
  const normalizedProvider = normalizeProviderName(provider);
  const currentCooldown = providerCooldowns.get(normalizedProvider);

  if (!currentCooldown) {
    return null;
  }

  if (Date.now() >= currentCooldown.cooldownUntil) {
    providerCooldowns.delete(normalizedProvider);
    return null;
  }

  return {
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((currentCooldown.cooldownUntil - Date.now()) / 1000)
    ),
    cooldownUntil: currentCooldown.cooldownUntil,
  };
};

const normalizeAiError = (error, provider = "") => {
  const normalizedProvider = normalizeProviderName(provider || error?.provider);
  const providerLabel = getProviderLabel(normalizedProvider);
  const rawMessage = String(
    error?.providerMessage || error?.message || error?.error?.message || ""
  ).toLowerCase();
  const statusCode = error?.providerStatusCode || error?.statusCode;
  const retryAfterSeconds =
    error?.retryAfterSeconds || parseRetryAfterSeconds(error?.retryAfterHeader);

  if (
    statusCode === 429 ||
    rawMessage.includes("quota") ||
    rawMessage.includes("rate limit") ||
    rawMessage.includes("resource_exhausted") ||
    rawMessage.includes("too many requests") ||
    rawMessage.includes("insufficient quota")
  ) {
    return createNormalizedAiError(
      "provider_rate_limit",
      `${providerLabel} free model is temporarily rate-limited. Your SomuPilot credits were not used.`,
      429,
      retryAfterSeconds || 60
    );
  }

  if (
    statusCode === 401 ||
    statusCode === 403 ||
    rawMessage.includes("api key not valid") ||
    rawMessage.includes("invalid api key") ||
    rawMessage.includes("incorrect api key") ||
    rawMessage.includes("authentication") ||
    rawMessage.includes("unauthorized")
  ) {
    return createNormalizedAiError(
      "auth",
      `${providerLabel} API key is invalid or missing.`,
      503
    );
  }

  if (
    statusCode === 402 ||
    rawMessage.includes("payment required") ||
    rawMessage.includes("billing") ||
    rawMessage.includes("requires credits")
  ) {
    return createNormalizedAiError(
      "billing",
      `${providerLabel} may require paid credits for this model.`,
      402
    );
  }

  if (
    statusCode === 400 ||
    statusCode === 404 ||
    rawMessage.includes("model_not_found") ||
    rawMessage.includes("model not found") ||
    rawMessage.includes("invalid model") ||
    rawMessage.includes("unknown model") ||
    rawMessage.includes("no such model") ||
    rawMessage.includes("model is not available")
  ) {
    return createNormalizedAiError(
      "model",
      `Selected ${providerLabel} model is not available.`,
      400
    );
  }

  if (
    error?.name === "AbortError" ||
    rawMessage.includes("timeout") ||
    rawMessage.includes("timed out") ||
    rawMessage.includes("etimedout")
  ) {
    return createNormalizedAiError(
      "timeout",
      `${providerLabel} service is temporarily unavailable.`,
      503
    );
  }

  if (
    statusCode === 408 ||
    statusCode === 500 ||
    statusCode === 502 ||
    statusCode === 503 ||
    statusCode === 504 ||
    rawMessage.includes("service unavailable") ||
    rawMessage.includes("fetch failed") ||
    rawMessage.includes("network") ||
    rawMessage.includes("temporarily unavailable")
  ) {
    return createNormalizedAiError(
      "service_unavailable",
      `${providerLabel} service is temporarily unavailable.`,
      503,
      retryAfterSeconds
    );
  }

  return createNormalizedAiError(
    "unknown",
    `${providerLabel} could not respond right now.`,
    500
  );
};

const logAiProviderError = ({ provider, statusCode, errorType, message, retryAfterSeconds }) => {
  const payload = {
    provider,
    statusCode: statusCode || null,
    errorType,
  };

  if (typeof retryAfterSeconds === "number") {
    payload.retryAfterSeconds = retryAfterSeconds;
  }

  if (process.env.NODE_ENV === "development" && message) {
    payload.message = message;
  }

  const recoverableErrorTypes = new Set([
    "provider_rate_limit",
    "model",
    "service_unavailable",
    "timeout",
  ]);

  if (recoverableErrorTypes.has(errorType)) {
    console.warn("AI provider warning:", payload);
    return;
  }

  console.error("AI provider error:", payload);
};

const getConfiguredProvider = () => {
  const configured = normalizeProviderName(process.env.AI_PROVIDER || DEFAULT_PROVIDER);
  return configured || DEFAULT_PROVIDER;
};

const getProviderOrder = () => {
  const mode = getConfiguredProvider();

  if (mode !== "auto") {
    return PROVIDERS.includes(mode) ? [mode] : [];
  }

  const fallbackProviders = String(
    process.env.AI_FALLBACK_PROVIDERS || PROVIDERS.join(",")
  )
    .split(",")
    .map(normalizeProviderName)
    .filter(
      (provider, index, array) =>
        PROVIDERS.includes(provider) && array.indexOf(provider) === index
    );

  return fallbackProviders.length > 0 ? fallbackProviders : [...PROVIDERS];
};

const getProviderOrderForRequest = (overrideProvider) => {
  const baseOrder = getProviderOrder();
  const normalizedOverride = normalizeProviderName(overrideProvider);
  const allowFallbackOnManualProvider =
    String(process.env.ALLOW_FALLBACK_ON_MANUAL_PROVIDER || "false").toLowerCase() === "true";

  if (!normalizedOverride || normalizedOverride === "auto") {
    return baseOrder;
  }

  if (!PROVIDERS.includes(normalizedOverride)) {
    return [];
  }

  if (!allowFallbackOnManualProvider) {
    return [normalizedOverride];
  }

  return [
    normalizedOverride,
    ...baseOrder.filter((provider) => provider !== normalizedOverride),
  ];
};

const getProviderStatus = () => ({
  mode: getConfiguredProvider(),
  fallbackOrder: getProviderOrder(),
  cooldowns: Object.fromEntries(
    PROVIDERS.map((provider) => [provider, getProviderCooldown(provider)])
  ),
  presets: Object.fromEntries(
    MODEL_PRESET_LEVELS.map((presetLevel) => {
      const presetConfig = getPresetConfig(presetLevel);
      const presetProvider = presetConfig.provider;
      const cooldown =
        presetProvider && presetProvider !== "auto" ? getProviderCooldown(presetProvider) : null;
      const configured =
        presetProvider === "auto" ? true : isProviderConfigured(presetProvider);

      return [
        presetLevel,
        {
          ...presetConfig,
          configured,
          cooldown,
          status:
            presetProvider === "auto"
              ? "available"
              : !configured
                ? "not_configured"
                : cooldown
                  ? "cooling_down"
                  : presetProvider === "ollama"
                    ? "local_only"
                    : "available",
        },
      ];
    })
  ),
  providers: {
    groq: {
      configured: isProviderConfigured("groq"),
      model: getProviderModel("groq"),
    },
    gemini: {
      configured: isProviderConfigured("gemini"),
      model: getProviderModel("gemini"),
    },
    openrouter: {
      configured: isProviderConfigured("openrouter"),
      model: getProviderModel("openrouter"),
      allowModelFallback:
        String(process.env.OPENROUTER_ALLOW_MODEL_FALLBACK || "true").toLowerCase() === "true",
      allowFallbackOnManualProvider:
        String(process.env.ALLOW_FALLBACK_ON_MANUAL_PROVIDER || "false").toLowerCase() === "true",
    },
    huggingface: {
      configured: isProviderConfigured("huggingface"),
      model: getProviderModel("huggingface"),
    },
    mistral: {
      configured: isProviderConfigured("mistral"),
      model: getProviderModel("mistral"),
    },
    ollama: {
      configured: true,
      local: true,
      model: getProviderModel("ollama"),
      baseUrl: process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL,
    },
  },
});

const mapConversationForOpenAiStyle = (messages, systemPrompt) => {
  const mappedMessages = [];

  if (systemPrompt?.trim()) {
    mappedMessages.push({
      role: "system",
      content: systemPrompt.trim(),
    });
  }

  for (const message of messages.slice(-CONTEXT_MESSAGE_LIMIT)) {
    if (message.role === "system") {
      continue;
    }

    mappedMessages.push({
      role: message.role,
      content: message.content,
    });
  }

  return mappedMessages;
};

const mapConversationForGemini = (messages) =>
  messages
    .filter((message) => message.role !== "system")
    .slice(-CONTEXT_MESSAGE_LIMIT)
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

const extractGeminiText = (responseData) =>
  responseData?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim() || "";

const extractOpenAiStyleText = (responseData) =>
  responseData?.choices?.[0]?.message?.content?.trim() || "";

const extractOllamaText = (responseData) =>
  responseData?.message?.content?.trim() || responseData?.response?.trim() || "";

const withTimeout = async (callback) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await callback(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
};

const toProviderFailure = (provider, error) => {
  const normalized = normalizeAiError(error, provider);
  logAiProviderError({
    provider,
    statusCode: error?.providerStatusCode || error?.statusCode || normalized.statusCode,
    errorType: normalized.type,
    retryAfterSeconds: normalized.retryAfterSeconds,
    message: error?.providerMessage || error?.message,
  });

  return {
    provider,
    type: normalized.type,
    statusCode: normalized.statusCode,
    userMessage: normalized.userMessage,
    retryAfterSeconds: normalized.retryAfterSeconds,
    model: error?.providerModel || getProviderModel(provider),
  };
};

const buildFailureHttpError = (failure) =>
  createHttpError(failure.statusCode, failure.userMessage, {
    errorType: failure.type,
    retryAfterSeconds: failure.retryAfterSeconds,
    provider: failure.provider,
    model: failure.model,
  });

const createMissingConfigError = (provider, message = "Missing provider configuration") => ({
  providerStatusCode: 503,
  providerMessage: message,
  message,
  provider,
  providerModel: getProviderModel(provider),
});

const callGemini = async ({ messages, systemPrompt, preferredModel }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = getProviderModel("gemini", preferredModel);

  if (!apiKey) {
    throw createMissingConfigError("gemini", "Gemini API key is missing");
  }

  const response = await withTimeout((signal) =>
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      signal,
      body: JSON.stringify({
        contents: mapConversationForGemini(messages),
        systemInstruction: {
          parts: [{ text: systemPrompt || SYSTEM_PROMPT }],
        },
      }),
    })
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw {
      provider: "gemini",
      providerModel: model,
      providerStatusCode: response.status,
      providerMessage: data?.error?.message || "Gemini request failed",
      retryAfterHeader: response.headers.get("retry-after"),
    };
  }

  const text = extractGeminiText(data);

  if (!text) {
    throw {
      provider: "gemini",
      providerModel: model,
      providerStatusCode: 503,
      providerMessage: "Gemini returned an empty response",
    };
  }

  return { text, provider: "gemini", model };
};

const callGroq = async ({ messages, systemPrompt, preferredModel }) => {
  const apiKey = process.env.GROQ_API_KEY;
  const model = getProviderModel("groq", preferredModel);

  if (!apiKey) {
    throw createMissingConfigError("groq", "Groq API key is missing");
  }

  const response = await withTimeout((signal) =>
    fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal,
      body: JSON.stringify({
        model,
        messages: mapConversationForOpenAiStyle(messages, systemPrompt),
        temperature: 0.4,
      }),
    })
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw {
      provider: "groq",
      providerModel: model,
      providerStatusCode: response.status,
      providerMessage: data?.error?.message || "Groq request failed",
      retryAfterHeader: response.headers.get("retry-after"),
    };
  }

  const text = extractOpenAiStyleText(data);

  if (!text) {
    throw {
      provider: "groq",
      providerModel: model,
      providerStatusCode: 503,
      providerMessage: "Groq returned an empty response",
    };
  }

  return { text, provider: "groq", model };
};

const callOpenRouter = async ({ messages, systemPrompt, overrideProvider, preferredModel }) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const configuredModel = getProviderModel("openrouter", preferredModel);
  const allowModelFallback =
    String(process.env.OPENROUTER_ALLOW_MODEL_FALLBACK || "true").toLowerCase() === "true";
  const allowFallbackOnManualProvider =
    String(process.env.ALLOW_FALLBACK_ON_MANUAL_PROVIDER || "false").toLowerCase() === "true";
  const manualProviderSelected = normalizeProviderName(overrideProvider) === "openrouter";
  const explicitProviderOnly =
    manualProviderSelected ||
    (!overrideProvider &&
      normalizeProviderName(process.env.AI_PROVIDER || DEFAULT_PROVIDER) === "openrouter");
  const shouldTryFallbackModels =
    (!manualProviderSelected && !explicitProviderOnly) ||
    allowModelFallback ||
    (manualProviderSelected && allowFallbackOnManualProvider);

  if (!apiKey) {
    throw createMissingConfigError("openrouter", "OpenRouter API key is missing");
  }

  const uniqueModels = [
    configuredModel,
    ...(shouldTryFallbackModels
      ? OPENROUTER_FALLBACK_MODELS.filter((candidate) => candidate !== configuredModel)
      : []),
  ];

  let lastError = null;

  for (const model of uniqueModels) {
    if (process.env.NODE_ENV === "development") {
      console.log("Calling OpenRouter");
      console.log("Model:", model);
      console.log("Key exists:", !!process.env.OPENROUTER_API_KEY);
    }

    const response = await withTimeout((signal) =>
      fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": (process.env.CLIENT_URL || "http://localhost:5173")
            .split(",")[0]
            .trim(),
          "X-Title": "SomuPilot AI",
        },
        signal,
        body: JSON.stringify({
          model,
          messages: mapConversationForOpenAiStyle(messages, systemPrompt),
          temperature: 0.4,
        }),
      })
    );

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      const text = extractOpenAiStyleText(data);

      if (!text) {
        lastError = {
          provider: "openrouter",
          providerModel: model,
          providerStatusCode: 503,
          providerMessage: "OpenRouter returned an empty response",
        };
        continue;
      }

      return { text, provider: "openrouter", model };
    }

    const providerError = {
      provider: "openrouter",
      providerModel: model,
      providerStatusCode: response.status,
      providerMessage: data?.error?.message || data?.message || "OpenRouter request failed",
      providerErrorCode: data?.error?.code || data?.code,
      retryAfterHeader: response.headers.get("retry-after"),
    };

    const normalized = normalizeAiError(providerError, "openrouter");

    if (normalized.type === "provider_rate_limit") {
      setProviderCooldown("openrouter", normalized.retryAfterSeconds || 60);
      throw {
        ...providerError,
        retryAfterSeconds: normalized.retryAfterSeconds || 60,
      };
    }

    if (
      shouldTryFallbackModels &&
      normalized.type === "model" &&
      model !== uniqueModels[uniqueModels.length - 1]
    ) {
      lastError = providerError;
      continue;
    }

    throw providerError;
  }

  throw (
    lastError || {
      provider: "openrouter",
      providerModel: configuredModel,
      providerStatusCode: 503,
      providerMessage: "OpenRouter request failed",
    }
  );
};

const callHuggingFace = async ({ messages, systemPrompt, preferredModel }) => {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  const model = getProviderModel("huggingface", preferredModel);

  if (!apiKey) {
    throw createMissingConfigError("huggingface", "Hugging Face API key is missing");
  }

  const response = await withTimeout((signal) =>
    fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal,
      body: JSON.stringify({
        model,
        messages: mapConversationForOpenAiStyle(messages, systemPrompt),
        temperature: 0.4,
      }),
    })
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw {
      provider: "huggingface",
      providerModel: model,
      providerStatusCode: response.status,
      providerMessage:
        data?.error?.message || data?.message || data?.error || "Hugging Face request failed",
      retryAfterHeader: response.headers.get("retry-after"),
    };
  }

  const text = extractOpenAiStyleText(data);

  if (!text) {
    throw {
      provider: "huggingface",
      providerModel: model,
      providerStatusCode: 503,
      providerMessage: "Hugging Face returned an empty response",
    };
  }

  return { text, provider: "huggingface", model };
};

const callMistral = async ({ messages, systemPrompt, preferredModel }) => {
  const apiKey = process.env.MISTRAL_API_KEY;
  const model = getProviderModel("mistral", preferredModel);

  if (!apiKey) {
    throw createMissingConfigError("mistral", "Mistral API key is missing");
  }

  const response = await withTimeout((signal) =>
    fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal,
      body: JSON.stringify({
        model,
        messages: mapConversationForOpenAiStyle(messages, systemPrompt),
        temperature: 0.4,
      }),
    })
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw {
      provider: "mistral",
      providerModel: model,
      providerStatusCode: response.status,
      providerMessage: data?.message || data?.error || "Mistral request failed",
      retryAfterHeader: response.headers.get("retry-after"),
    };
  }

  const text = extractOpenAiStyleText(data);

  if (!text) {
    throw {
      provider: "mistral",
      providerModel: model,
      providerStatusCode: 503,
      providerMessage: "Mistral returned an empty response",
    };
  }

  return { text, provider: "mistral", model };
};

const callOllama = async ({ messages, systemPrompt, preferredModel }) => {
  const baseUrl = (process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL).replace(/\/$/, "");
  const model = getProviderModel("ollama", preferredModel);

  const response = await withTimeout((signal) =>
    fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal,
      body: JSON.stringify({
        model,
        stream: false,
        messages: mapConversationForOpenAiStyle(messages, systemPrompt),
      }),
    })
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw {
      provider: "ollama",
      providerModel: model,
      providerStatusCode: response.status,
      providerMessage: data?.error || data?.message || "Ollama request failed",
      retryAfterHeader: response.headers.get("retry-after"),
    };
  }

  const text = extractOllamaText(data);

  if (!text) {
    throw {
      provider: "ollama",
      providerModel: model,
      providerStatusCode: 503,
      providerMessage: "Ollama returned an empty response",
    };
  }

  return { text, provider: "ollama", model };
};

const providerHandlers = {
  groq: callGroq,
  gemini: callGemini,
  openrouter: callOpenRouter,
  huggingface: callHuggingFace,
  mistral: callMistral,
  ollama: callOllama,
};

const resolveSelection = ({ overrideProvider, selectedModelLevel, overrideModel }) => {
  const normalizedPreset = normalizeModelPreset(selectedModelLevel);
  const normalizedProvider = normalizeProviderName(overrideProvider);

  if (normalizedPreset) {
    const presetConfig = getPresetConfig(normalizedPreset);
    const safeModel = getSafeRequestedModel(presetConfig.provider, overrideModel) || presetConfig.model;

    return {
      provider: presetConfig.provider,
      model: safeModel,
      preset: presetConfig.key,
    };
  }

  if (normalizedProvider && PROVIDERS.includes(normalizedProvider)) {
    return {
      provider: normalizedProvider,
      model: getSafeRequestedModel(normalizedProvider, overrideModel),
      preset: "auto",
    };
  }

  return {
    provider: normalizedProvider || "auto",
    model: "",
    preset: "auto",
  };
};

const generateAiResponse = async ({
  messages,
  systemPrompt = SYSTEM_PROMPT,
  overrideProvider,
  overrideModel,
  selectedModelLevel,
}) => {
  const resolvedSelection = resolveSelection({
    overrideProvider,
    selectedModelLevel,
    overrideModel,
  });
  const providerOrder = getProviderOrderForRequest(resolvedSelection.provider);

  if (providerOrder.length === 0) {
    throw createHttpError(
      503,
      "AI service is not configured properly. Please contact the app owner.",
      { errorType: "auth" }
    );
  }

  const failures = [];
  const configuredMode = getConfiguredProvider();
  const manualProviderSelected =
    resolvedSelection.provider &&
    resolvedSelection.provider !== "auto" &&
    PROVIDERS.includes(resolvedSelection.provider);

  for (const provider of providerOrder) {
    const handler = providerHandlers[provider];

    if (!handler) {
      continue;
    }

    if (!isProviderConfigured(provider)) {
      if (manualProviderSelected && provider === resolvedSelection.provider) {
        failures.push({
          provider,
          type: "auth",
          statusCode: 503,
          userMessage: `${getProviderLabel(provider)} API key is invalid or missing.`,
          model: resolvedSelection.model || getProviderModel(provider),
        });
      }

      if (process.env.NODE_ENV === "development") {
        console.log("Skipping provider due to missing config:", {
          provider,
          selectedProvider: resolvedSelection.provider || configuredMode,
        });
      }
      continue;
    }

    const cooldown = getProviderCooldown(provider);

    if (cooldown) {
      if (process.env.NODE_ENV === "development") {
        console.log("Skipping provider due to cooldown:", {
          provider,
          retryAfterSeconds: cooldown.retryAfterSeconds,
          selectedProvider: resolvedSelection.provider || configuredMode,
        });
      }

      if (manualProviderSelected && provider === resolvedSelection.provider) {
        failures.push({
          provider,
          type: "provider_rate_limit",
          statusCode: 429,
          userMessage: `${getProviderLabel(provider)} free model is temporarily rate-limited. Your SomuPilot credits were not used.`,
          retryAfterSeconds: cooldown.retryAfterSeconds,
          model: getProviderModel(provider),
        });
      }

      continue;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("AI provider attempt:", {
        selectedProvider: resolvedSelection.provider || configuredMode,
        selectedModelLevel: resolvedSelection.preset,
        aiProvider: configuredMode,
        providerAttempted: provider,
        modelAttempted:
          provider === resolvedSelection.provider && resolvedSelection.model
            ? resolvedSelection.model
            : getProviderModel(provider),
      });
    }

    try {
      const response = await handler({
        messages,
        systemPrompt,
        overrideProvider: resolvedSelection.provider,
        preferredModel:
          provider === resolvedSelection.provider ? resolvedSelection.model : "",
      });

      return {
        ...response,
        preset: resolvedSelection.preset || "auto",
      };
    } catch (error) {
      const failure = toProviderFailure(provider, error);

      if (failure.type === "provider_rate_limit") {
        setProviderCooldown(provider, failure.retryAfterSeconds || 60);
      }

      failures.push(failure);
    }
  }

  const highestPriorityFailure =
    failures.find((failure) => failure.type === "provider_rate_limit") ||
    failures.find((failure) => failure.type === "model") ||
    failures.find((failure) => failure.type === "billing") ||
    failures.find((failure) => failure.type === "service_unavailable") ||
    failures.find((failure) => failure.type === "timeout") ||
    failures.find((failure) => failure.type === "auth") ||
    failures[0];

  if (!highestPriorityFailure) {
    throw createHttpError(500, "AI could not respond right now. Please try again.", {
      errorType: "unknown",
    });
  }

  throw buildFailureHttpError(highestPriorityFailure);
};

const generateAiReply = async ({ messages, systemPrompt = SYSTEM_PROMPT }) => {
  const response = await generateAiResponse({ messages, systemPrompt });
  return response.text;
};

export {
  CONTEXT_MESSAGE_LIMIT,
  DEFAULT_OPENROUTER_MODEL,
  MODEL_PRESET_LEVELS,
  OPENROUTER_FALLBACK_MODELS,
  PROVIDERS,
  PROVIDER_LABELS,
  SYSTEM_PROMPT,
  generateAiReply,
  generateAiResponse,
  getAllowedModelsForProvider,
  getProviderCooldown,
  getPresetConfig,
  getProviderLabel,
  getProviderModel,
  getProviderOrder,
  getProviderOrderForRequest,
  getProviderStatus,
  isProviderConfigured,
  normalizeModelPreset,
  normalizeAiError,
  normalizeProviderName,
  resolveSelection,
  setProviderCooldown,
};
