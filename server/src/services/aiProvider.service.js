import createHttpError from "../utils/createHttpError.js";

const SYSTEM_PROMPT =
  "You are SomuPilot, a helpful personal AI assistant for productivity, learning, planning, notes, tasks, and document help. Be clear, practical, and friendly.";

const CONTEXT_MESSAGE_LIMIT = 12;
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_FALLBACK_MODELS = [
  DEFAULT_GEMINI_MODEL,
  "gemini-flash-latest",
  "gemini-2.0-flash",
];

const mapConversationForGemini = (messages) =>
  messages
    .filter((message) => message.role !== "system")
    .slice(-CONTEXT_MESSAGE_LIMIT)
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

const extractGeminiText = (responseData) => {
  const text = responseData?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  return text || "";
};

const normalizeModelName = (model) => model.replace(/^models\//, "");

const buildGeminiModelCandidates = (requestedModel) => {
  const candidates = [requestedModel, ...GEMINI_FALLBACK_MODELS]
    .filter(Boolean)
    .map(normalizeModelName);

  return [...new Set(candidates)];
};

const postToGemini = async ({ model, apiKey, messages }) =>
  fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: mapConversationForGemini(messages),
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
      }),
    }
  );

const generateWithGemini = async ({ messages }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const requestedModel = process.env.AI_MODEL || DEFAULT_GEMINI_MODEL;

  if (!apiKey) {
    throw createHttpError(503, "AI service is temporarily unavailable.");
  }

  const candidateModels = buildGeminiModelCandidates(requestedModel);
  let lastErrorMessage = "";

  for (const model of candidateModels) {
    const response = await postToGemini({ model, apiKey, messages });
    const data = await response.json();

    if (!response.ok) {
      lastErrorMessage = data?.error?.message || "";

      if (response.status === 404) {
        continue;
      }

      throw createHttpError(503, "AI service is temporarily unavailable.");
    }

    const reply = extractGeminiText(data);

    if (!reply) {
      throw createHttpError(503, "AI service is temporarily unavailable.");
    }

    return reply;
  }

  if (lastErrorMessage) {
    throw createHttpError(503, "AI service is temporarily unavailable.");
  }

  throw createHttpError(503, "AI service is temporarily unavailable.");
};

const generateAiReply = async ({ messages }) => {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();

  if (provider === "gemini") {
    return generateWithGemini({ messages });
  }

  if (provider === "groq" || provider === "ollama") {
    throw createHttpError(503, "Selected AI provider is not configured yet.");
  }

  throw createHttpError(503, "AI service is temporarily unavailable.");
};

export { CONTEXT_MESSAGE_LIMIT, SYSTEM_PROMPT, generateAiReply };
