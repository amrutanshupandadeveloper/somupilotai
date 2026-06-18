const MODEL_PRESET_STORAGE_KEY = "somupilot:selectedModelPreset";
const LEGACY_MODEL_STORAGE_KEY = "somupilot_ai_model_preference";

const MODEL_PRESET_ORDER = ["auto", "high", "medium", "low"];

const BASE_MODEL_PRESETS = {
  auto: {
    key: "auto",
    label: "Auto",
    icon: "sparkles",
    provider: "auto",
    modelLevel: "auto",
    description: "Best available provider automatically",
    modelName: "Smart fallback chain",
  },
  high: {
    key: "high",
    label: "High",
    icon: "zap",
    provider: "gemini",
    modelLevel: "high",
    description: "Best quality response",
    modelName: "Gemini 2.5 Flash",
  },
  medium: {
    key: "medium",
    label: "Medium",
    icon: "gauge",
    provider: "groq",
    modelLevel: "medium",
    description: "Balanced speed and quality",
    modelName: "Groq Llama 3.1 8B",
  },
  low: {
    key: "low",
    label: "Low",
    icon: "leaf",
    provider: "openrouter",
    modelLevel: "low",
    description: "Free/low-cost fallback",
    modelName: "OpenRouter Llama 3.2 3B Free",
  },
};

const LEGACY_PRESET_MAP = {
  auto: "auto",
  groq: "medium",
  gemini: "high",
  openrouter: "low",
  "hugging face": "medium",
  huggingface: "medium",
  mistral: "medium",
  ollama: "low",
};

const normalizeModelPreset = (value) => {
  const normalizedValue = String(value || "")
    .trim()
    .toLowerCase();

  if (MODEL_PRESET_ORDER.includes(normalizedValue)) {
    return normalizedValue;
  }

  return LEGACY_PRESET_MAP[normalizedValue] || "auto";
};

const getStoredModelPreset = () => {
  if (typeof window === "undefined") {
    return "auto";
  }

  const nextValue =
    window.localStorage.getItem(MODEL_PRESET_STORAGE_KEY) ||
    window.localStorage.getItem(LEGACY_MODEL_STORAGE_KEY) ||
    "auto";

  return normalizeModelPreset(nextValue);
};

const persistModelPreset = (presetKey) => {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedPreset = normalizeModelPreset(presetKey);
  window.localStorage.setItem(MODEL_PRESET_STORAGE_KEY, normalizedPreset);
  window.localStorage.removeItem(LEGACY_MODEL_STORAGE_KEY);
};

const formatProviderName = (provider) => {
  const normalizedProvider = String(provider || "").trim().toLowerCase();

  switch (normalizedProvider) {
    case "openrouter":
      return "OpenRouter";
    case "huggingface":
      return "Hugging Face";
    case "groq":
      return "Groq";
    case "gemini":
      return "Gemini";
    case "mistral":
      return "Mistral";
    case "ollama":
      return "Ollama";
    case "auto":
      return "Auto";
    default:
      return normalizedProvider ? normalizedProvider.charAt(0).toUpperCase() + normalizedProvider.slice(1) : "AI";
  }
};

const prettifyModelName = (modelName) => {
  const value = String(modelName || "").trim();

  if (!value) {
    return "";
  }

  return value
    .replace(/[:/]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const buildModelPresetOptions = (providerStatus) =>
  MODEL_PRESET_ORDER.map((presetKey) => {
    const fallbackPreset = BASE_MODEL_PRESETS[presetKey];
    const serverPreset = providerStatus?.presets?.[presetKey];
    const provider = serverPreset?.provider || fallbackPreset.provider;
    const modelName = serverPreset?.modelDisplayName || serverPreset?.modelName || serverPreset?.model;

    return {
      ...fallbackPreset,
      provider,
      modelName: modelName || fallbackPreset.modelName || prettifyModelName(serverPreset?.model),
      description: serverPreset?.description || fallbackPreset.description,
      configured:
        typeof serverPreset?.configured === "boolean"
          ? serverPreset.configured
          : provider === "auto"
            ? true
            : Boolean(providerStatus?.providers?.[provider]?.configured),
      cooldown: serverPreset?.cooldown || providerStatus?.cooldowns?.[provider] || null,
      status: serverPreset?.status || "",
      model: serverPreset?.model || "",
    };
  });

export {
  BASE_MODEL_PRESETS,
  MODEL_PRESET_ORDER,
  MODEL_PRESET_STORAGE_KEY,
  buildModelPresetOptions,
  formatProviderName,
  getStoredModelPreset,
  normalizeModelPreset,
  persistModelPreset,
  prettifyModelName,
};
