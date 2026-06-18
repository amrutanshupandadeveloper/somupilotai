const MAX_WEB_SOURCES = 5;

const WEB_SEARCH_KEYWORDS = [
  "latest",
  "current",
  "today",
  "2026",
  "search web",
  "website scan",
  "news",
  "price",
  "job vacancy",
  "github repo scan",
  "docs",
  "recent",
];

const normalizeDomain = (url = "") => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch (_error) {
    return "";
  }
};

const normalizeSource = (result = {}) => {
  const url = String(result.url || result.link || "").trim();

  if (!url) {
    return null;
  }

  return {
    title: String(result.title || "").trim(),
    url,
    domain: normalizeDomain(url),
    snippet: String(result.snippet || result.content || result.description || "").trim(),
    faviconUrl: String(result.faviconUrl || "").trim(),
    sourceType: "web",
  };
};

const isWebSearchEnabled = () =>
  String(process.env.WEB_SEARCH_ENABLED || "false").toLowerCase() === "true";

const getWebSearchProvider = () =>
  String(process.env.WEB_SEARCH_PROVIDER || "tavily").trim().toLowerCase();

const needsWebSearch = (query = "") => {
  const lowerQuery = String(query || "").trim().toLowerCase();

  if (!lowerQuery) {
    return false;
  }

  return WEB_SEARCH_KEYWORDS.some((keyword) => lowerQuery.includes(keyword));
};

const searchWithTavily = async (query) => {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      message: "Web search is not configured.",
      sources: [],
    };
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: MAX_WEB_SOURCES,
      search_depth: "basic",
      include_answer: false,
      include_images: false,
      include_raw_content: false,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      success: false,
      message: data?.error || data?.message || "Web search could not complete.",
      sources: [],
    };
  }

  const sources = Array.isArray(data?.results)
    ? data.results.map(normalizeSource).filter(Boolean).slice(0, MAX_WEB_SOURCES)
    : [];

  return {
    success: true,
    message: sources.length > 0 ? "Web search completed successfully." : "No live sources found.",
    sources,
  };
};

const searchWeb = async (query = "") => {
  const trimmedQuery = String(query || "").trim();

  if (!trimmedQuery) {
    return {
      success: false,
      message: "Search query is required.",
      sources: [],
    };
  }

  if (!isWebSearchEnabled()) {
    return {
      success: false,
      message: "Web search is not configured.",
      sources: [],
    };
  }

  try {
    switch (getWebSearchProvider()) {
      case "tavily":
      default:
        return await searchWithTavily(trimmedQuery);
    }
  } catch (_error) {
    return {
      success: false,
      message: "Web search could not complete.",
      sources: [],
    };
  }
};

export {
  MAX_WEB_SOURCES,
  getWebSearchProvider,
  isWebSearchEnabled,
  needsWebSearch,
  searchWeb,
};
