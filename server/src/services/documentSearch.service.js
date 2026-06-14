const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
  "by", "from", "up", "about", "into", "through", "during", "before", "after",
  "above", "below", "between", "under", "again", "further", "then", "once",
  "here", "there", "when", "where", "why", "how", "all", "each", "few", "more",
  "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same",
  "so", "than", "too", "very", "can", "will", "just", "should", "now",
  "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
  "my", "your", "his", "its", "our", "their", "mine", "yours", "hers", "ours", "theirs",
  "this", "that", "these", "those", "is", "am", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "but", "if", "because",
  "as", "until", "while", "of", "at", "by", "for", "with", "about", "against",
  "between", "into", "through", "during", "before", "after", "above", "below",
  "to", "from", "up", "down", "in", "out", "on", "off", "over", "under",
  "again", "further", "then", "once", "here", "there", "when", "where", "why", "how",
  "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no",
  "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t",
  "don", "should", "ve", "ll", "ain", "aren", "couldn", "didn", "doesn",
  "hadn", "hasn", "haven", "isn", "ma", "mightn", "mustn", "needn", "shan",
  "shouldn", "wasn", "weren", "won", "wouldn",
]);

const tokenize = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
};

const scoreChunk = (chunk, questionTokens) => {
  const chunkTokens = tokenize(chunk.text);
  const chunkTokenSet = new Set(chunkTokens);
  
  let score = 0;
  let matchedKeywords = [];

  for (const token of questionTokens) {
    if (chunkTokenSet.has(token)) {
      score += 1;
      matchedKeywords.push(token);
    }
  }

  return { score, matchedKeywords };
};

const searchRelevantChunks = (chunks, question, topK = 5) => {
  const questionTokens = tokenize(question);
  
  if (questionTokens.length === 0) {
    return chunks.slice(0, topK);
  }

  const scoredChunks = chunks.map((chunk) => {
    const { score, matchedKeywords } = scoreChunk(chunk, questionTokens);
    return { ...chunk, score, matchedKeywords };
  });

  scoredChunks.sort((a, b) => b.score - a.score);

  const topChunks = scoredChunks.slice(0, topK);
  
  return topChunks.map(({ score, matchedKeywords, ...chunk }) => chunk);
};

export { searchRelevantChunks };
