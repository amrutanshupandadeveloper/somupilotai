const FILLER_PREFIXES = [
  /^(please|plz|kindly)\s+/i,
  /^(can you|could you|would you|will you)\s+/i,
  /^(help me|i need help to|i need help with)\s+/i,
  /^(i need to|i want to|i wanna|i would like to)\s+/i,
  /^(tell me|show me|give me|let me know)\s+/i,
  /^(how do i|how to)\s+/i,
];

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "my",
  "me",
  "i",
  "you",
  "your",
  "our",
  "their",
  "to",
  "for",
  "with",
  "on",
  "in",
  "of",
  "from",
  "and",
  "or",
  "is",
  "are",
  "be",
  "this",
  "that",
  "these",
  "those",
  "please",
  "can",
  "could",
  "would",
  "will",
  "should",
  "want",
  "need",
  "help",
  "make",
  "create",
  "build",
  "fix",
  "add",
  "show",
  "tell",
  "give",
]);

const TOPIC_NOISE_WORDS = new Set([
  ...STOP_WORDS,
  "best",
  "way",
  "revise",
  "revision",
  "study",
  "learn",
  "practice",
  "push",
  "guide",
  "about",
]);

const normalizeWord = (word) => {
  if (!word) return "";

  if (/^github$/i.test(word)) {
    return "GitHub";
  }

  if (/^chatgpt$/i.test(word)) {
    return "ChatGPT";
  }

  if (/^(ai|pdf|api|ui|ux|json|mongodb|mern)$/i.test(word)) {
    return word.toUpperCase();
  }

  if (/^\d/.test(word)) {
    return word;
  }

  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

const titleCase = (value) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map(normalizeWord)
    .join(" ");

const cleanMessage = (message) => {
  let cleaned = String(message || "")
    .replace(/[`*_#>\-[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const sentence = cleaned.split(/[.!?\n]/)[0]?.trim() || cleaned;
  cleaned = sentence;

  for (const pattern of FILLER_PREFIXES) {
    cleaned = cleaned.replace(pattern, "");
  }

  return cleaned
    .replace(/\s+/g, " ")
    .replace(/^(about|regarding|for)\s+/i, "")
    .trim();
};

const extractTopic = (message) => {
  const topicMatch = message.match(
    /\b(?:for|about|on|regarding|from|of)\s+([a-z0-9][a-z0-9\s-]{1,50})/i
  );

  const source = topicMatch?.[1] || message;

  return titleCase(
    source
      .split(/\s+/)
      .map((word) => word.replace(/[^a-z0-9-]/gi, ""))
      .filter((word) => word && !TOPIC_NOISE_WORDS.has(word.toLowerCase()))
      .slice(0, 3)
      .join(" ")
  );
};

const buildIntentTitle = (message) => {
  const lowerMessage = message.toLowerCase();
  const topic = extractTopic(message);
  const whatIsMatch = message.match(/\b(?:what is|what are|who is|who are)\s+(.+)/i);

  if (/(github|git|repo|repository)/i.test(lowerMessage)) {
    if (/(push|publish|upload)/i.test(lowerMessage)) return "GitHub Push Guide";
    if (/(commit)/i.test(lowerMessage)) return "Git Commit Help";
    if (/(branch|merge|pull request|pr)/i.test(lowerMessage)) return "Git Workflow Help";
    return "GitHub Help";
  }

  if (/(summari[sz]e|summary|explain|overview)/i.test(lowerMessage)) {
    if (/\bnotes?\b/i.test(lowerMessage)) return "Notes Summary";
    if (/\bpdf\b|\bdocument\b/i.test(lowerMessage)) return "Document Summary";
    return topic ? `${topic} Summary` : "Summary Request";
  }

  if (/(plan|roadmap|schedule|routine|strategy)/i.test(lowerMessage)) {
    if (/\bstudy\b|\bexam\b/i.test(lowerMessage)) return "Study Plan";
    if (/\btrip\b|\btravel\b/i.test(lowerMessage)) return "Travel Plan";
    return topic ? `${topic} Plan` : "Planning Session";
  }

  if (/(fix|debug|resolve|issue|error|bug|problem)/i.test(lowerMessage)) {
    return topic ? `${topic} Fix` : "Bug Fix";
  }

  if (/(create|build|make|generate)/i.test(lowerMessage)) {
    if (/\btask\b/i.test(lowerMessage)) return topic ? `${topic} Task` : "Task Creation";
    if (/\bnote\b/i.test(lowerMessage)) return topic ? `${topic} Note` : "Note Creation";
    if (/\bapi\b/i.test(lowerMessage)) return topic ? `${topic} API` : "API Build";
    return topic ? `${topic} Setup` : "New Request";
  }

  if (/(upload|pdf|document|file)/i.test(lowerMessage)) {
    if (/(ask|question|q&a)/i.test(lowerMessage)) return "PDF Q&A";
    return topic ? `${topic} Document` : "Document Help";
  }

  if (/(best|top|better|improve|improvement|tips)/i.test(lowerMessage)) {
    if (/(learn|study|revise|revision|practice)/i.test(lowerMessage)) {
      return topic ? `${topic} Study Tips` : "Study Tips";
    }
    return topic ? `${topic} Tips` : "Helpful Tips";
  }

  if (/(learn|study|revise|revision|practice)/i.test(lowerMessage)) {
    return topic ? `${topic} Study Help` : "Study Help";
  }

  if (whatIsMatch) {
    const subject = titleCase(
      whatIsMatch[1]
        .split(/\s+/)
        .map((word) => word.replace(/[^a-z0-9-]/gi, ""))
        .filter((word) => word && !STOP_WORDS.has(word.toLowerCase()))
        .slice(0, 3)
        .join(" ")
    );
    return subject ? `About ${subject}` : "Quick Explanation";
  }

  if (/(how|kaise|kese|kya|kyu|why|when|where)/i.test(lowerMessage)) {
    if (/(push|send|share)/i.test(lowerMessage) && topic) return `${topic} Guide`;
    return topic ? `${topic} Help` : "How-To Help";
  }

  if (/(design|ui|ux|theme|navbar|sidebar|layout|dark mode|light mode)/i.test(lowerMessage)) {
    return topic ? `${topic} UI Update` : "UI Update";
  }

  if (/(chat|conversation|reply|prompt)/i.test(lowerMessage)) {
    return topic ? `${topic} Chat` : "Chat Request";
  }

  if (/(admin|dashboard|panel)/i.test(lowerMessage)) {
    return topic ? `${topic} Admin` : "Admin Panel";
  }

  return "";
};

export const generateChatTitleFromInput = (message) => {
  const cleaned = cleanMessage(message);

  if (!cleaned) {
    return "New Chat";
  }

  let title = buildIntentTitle(cleaned);

  if (!title) {
    title = titleCase(
      cleaned
        .split(/\s+/)
        .map((word) => word.replace(/[^a-z0-9-]/gi, ""))
        .filter((word) => word && !STOP_WORDS.has(word.toLowerCase()))
        .slice(0, 4)
        .join(" ")
    );
  }

  if (!title && topic) {
    title = topic;
  }

  if (title.length > 52) {
    title = `${title.slice(0, 52).trimEnd()}...`;
  }

  return title || "New Chat";
};
