import createHttpError from "../utils/createHttpError.js";

const SYSTEM_PROMPT =
  "You are SomuPilot, a helpful personal AI assistant for productivity, learning, planning, notes, tasks, and document help. Be clear, practical, and friendly.";

const CONTEXT_MESSAGE_LIMIT = 12;

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

const generateWithGemini = async ({ messages }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.AI_MODEL || "gemini-1.5-flash";

  if (!apiKey) {
    throw createHttpError(503, "AI service is temporarily unavailable.");
  }

  const response = await fetch(
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

  if (!response.ok) {
    throw createHttpError(503, "AI service is temporarily unavailable.");
  }

  const data = await response.json();
  const reply = extractGeminiText(data);

  if (!reply) {
    throw createHttpError(503, "AI service is temporarily unavailable.");
  }

  return reply;
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
