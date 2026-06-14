import createHttpError from "../utils/createHttpError.js";

const SYSTEM_PROMPT =
  "You are SomuPilot, a helpful personal AI assistant for productivity, learning, planning, notes, tasks, and document help. Be clear, practical, and friendly.";

const CONTEXT_MESSAGE_LIMIT = 12;
const DEFAULT_PROVIDER = "auto";
const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";
const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";
const DEFAULT_OPENROUTER_MODEL = "meta-llama/llama-3.1-8b-instruct:free";
const DEFAULT_OLLAMA_MODEL = "llama3.1:8b";
const DEFAULT_OLLAMA_BASE_URL = "http://localhost:11434";
const PROVIDERS = ["gemini", "groq", "openrouter", "ollama"];
const REQUEST_TIMEOUT_MS = 30000;

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

const normalizeAiError = (error) => {
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
    rawMessage.includes("free tier limit") ||
    rawMessage.includes("insufficient quota")
  ) {
    return createNormalizedAiError(
      "quota",
      "AI service limit reached. Please try again after some time.",
      429,
      retryAfterSeconds
    );
  }

  if (
    statusCode === 401 ||
    statusCode === 403 ||
    rawMessage.includes("api key not valid") ||
    rawMessage.includes("invalid api key") ||
    rawMessage.includes("incorrect api key") ||
    rawMessage.includes("permission denied") ||
    rawMessage.includes("unauthenticated") ||
    rawMessage.includes("authentication")
  ) {
    return createNormalizedAiError(
      "auth",
      "AI service is not configured properly. Please contact the app owner.",
      503
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
      "AI service is temporarily unavailable. Please try again.",
      503
    );
  }

  if (
    statusCode === 404 ||
    statusCode === 408 ||
    statusCode === 502 ||
    statusCode === 503 ||
    statusCode === 504 ||
    rawMessage.includes("service unavailable") ||
    rawMessage.includes("model unavailable") ||
    rawMessage.includes("model is not found") ||
    rawMessage.includes("network") ||
    rawMessage.includes("fetch failed") ||
    rawMessage.includes("temporarily unavailable")
  ) {
    return createNormalizedAiError(
      "service_unavailable",
      "AI service is temporarily unavailable. Please try again.",
      503,
      retryAfterSeconds
    );
  }

  return createNormalizedAiError(
    "unknown",
    "AI could not respond right now. Please try again.",
    500
  );
};

const logAiProviderError = ({ provider, statusCode, errorType, message }) => {
  const payload = {
    provider,
    statusCode: statusCode || null,
    errorType,
  };

  if (process.env.NODE_ENV === "development" && message) {
    payload.message = message;
  }

  console.error("AI provider error:", payload);
};

const normalizeProviderName = (provider) => String(provider || "").trim().toLowerCase();

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
    .filter((provider, index, array) => PROVIDERS.includes(provider) && array.indexOf(provider) === index);

  return fallbackProviders.length > 0 ? fallbackProviders : [...PROVIDERS];
};

const getProviderStatus = () => ({
  mode: getConfiguredProvider(),
  fallbackOrder: getProviderOrder(),
  providers: {
    gemini: {
      configured: Boolean(process.env.GEMINI_API_KEY),
      model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    },
    groq: {
      configured: Boolean(process.env.GROQ_API_KEY),
      model: process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
    },
    openrouter: {
      configured: Boolean(process.env.OPENROUTER_API_KEY),
      model: process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL,
    },
    ollama: {
      configured: true,
      local: true,
      model: process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL,
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
  const normalized = normalizeAiError(error);
  logAiProviderError({
    provider,
    statusCode: error?.providerStatusCode || error?.statusCode || normalized.statusCode,
    errorType: normalized.type,
    message: error?.providerMessage || error?.message,
  });

  return {
    provider,
    type: normalized.type,
    statusCode: normalized.statusCode,
    userMessage: normalized.userMessage,
    retryAfterSeconds: normalized.retryAfterSeconds,
  };
};

const buildFailureHttpError = (failure) =>
  createHttpError(failure.statusCode, failure.userMessage, {
    errorType: failure.type,
    retryAfterSeconds: failure.retryAfterSeconds,
  });

const createMissingConfigError = (provider, message = "Missing provider configuration") => ({
  providerStatusCode: 503,
  providerMessage: message,
  message,
  provider,
});

const callGemini = async ({ messages, systemPrompt }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

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

  const data = await response.json();

  if (!response.ok) {
    throw {
      providerStatusCode: response.status,
      providerMessage: data?.error?.message || "Gemini request failed",
      retryAfterHeader: response.headers.get("retry-after"),
    };
  }

  const text = extractGeminiText(data);

  if (!text) {
    throw {
      providerStatusCode: 503,
      providerMessage: "Gemini returned an empty response",
    };
  }

  return {
    text,
    provider: "gemini",
    model,
  };
};

const callGroq = async ({ messages, systemPrompt }) => {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;

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

  const data = await response.json();

  if (!response.ok) {
    throw {
      providerStatusCode: response.status,
      providerMessage: data?.error?.message || "Groq request failed",
      retryAfterHeader: response.headers.get("retry-after"),
    };
  }

  const text = extractOpenAiStyleText(data);

  if (!text) {
    throw {
      providerStatusCode: 503,
      providerMessage: "Groq returned an empty response",
    };
  }

  return {
    text,
    provider: "groq",
    model,
  };
};

const callOpenRouter = async ({ messages, systemPrompt }) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL;

  if (!apiKey) {
    throw createMissingConfigError("openrouter", "OpenRouter API key is missing");
  }

  const response = await withTimeout((signal) =>
    fetch("https://openrouter.ai/api/v1/chat/completions", {
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

  const data = await response.json();

  if (!response.ok) {
    throw {
      providerStatusCode: response.status,
      providerMessage:
        data?.error?.message || data?.message || "OpenRouter request failed",
      retryAfterHeader: response.headers.get("retry-after"),
    };
  }

  const text = extractOpenAiStyleText(data);

  if (!text) {
    throw {
      providerStatusCode: 503,
      providerMessage: "OpenRouter returned an empty response",
    };
  }

  return {
    text,
    provider: "openrouter",
    model,
  };
};

const callOllama = async ({ messages, systemPrompt }) => {
  const baseUrl = (process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL).replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL;

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

  const data = await response.json();

  if (!response.ok) {
    throw {
      providerStatusCode: response.status,
      providerMessage: data?.error || data?.message || "Ollama request failed",
      retryAfterHeader: response.headers.get("retry-after"),
    };
  }

  const text = extractOllamaText(data);

  if (!text) {
    throw {
      providerStatusCode: 503,
      providerMessage: "Ollama returned an empty response",
    };
  }

  return {
    text,
    provider: "ollama",
    model,
  };
};

const providerHandlers = {
  gemini: callGemini,
  groq: callGroq,
  openrouter: callOpenRouter,
  ollama: callOllama,
};

const generateAiResponse = async ({ messages, systemPrompt = SYSTEM_PROMPT, overrideProvider }) => {
  let providerOrder = getProviderOrder();

  if (overrideProvider && overrideProvider !== "auto" && PROVIDERS.includes(overrideProvider)) {
    providerOrder = [overrideProvider];
  }

  if (providerOrder.length === 0) {
    throw createHttpError(
      503,
      "AI service is not configured properly. Please contact the app owner.",
      { errorType: "auth" }
    );
  }

  const failures = [];

  for (const provider of providerOrder) {
    const handler = providerHandlers[provider];

    if (!handler) {
      continue;
    }

    try {
      return await handler({ messages, systemPrompt });
    } catch (error) {
      failures.push(toProviderFailure(provider, error));
    }
  }

  const highestPriorityFailure =
    failures.find((failure) => failure.type === "quota") ||
    failures.find((failure) => failure.type === "service_unavailable") ||
    failures.find((failure) => failure.type === "timeout") ||
    failures.find((failure) => failure.type === "auth") ||
    failures[0];

  if (!highestPriorityFailure) {
    throw createHttpError(500, "AI could not respond right now. Please try again.", {
      errorType: "unknown",
    });
  }

  if (failures.every((failure) => failure.type === "auth")) {
    throw createHttpError(
      503,
      "AI service is not configured properly. Please contact the app owner.",
      {
        errorType: "auth",
      }
    );
  }

  if (failures.some((failure) => failure.type === "quota")) {
    throw createHttpError(
      429,
      "AI service limit reached. Please try again after some time.",
      {
        errorType: "quota",
        retryAfterSeconds: highestPriorityFailure.retryAfterSeconds,
      }
    );
  }

  throw buildFailureHttpError(highestPriorityFailure);
};

const generateAiReply = async ({ messages, systemPrompt = SYSTEM_PROMPT }) => {
  const response = await generateAiResponse({ messages, systemPrompt });
  return response.text;
};

export {
  CONTEXT_MESSAGE_LIMIT,
  SYSTEM_PROMPT,
  generateAiReply,
  generateAiResponse,
  getProviderStatus,
  normalizeAiError,
};
