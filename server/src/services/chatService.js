import Conversation from "../models/Conversation.js";
import createHttpError from "../utils/createHttpError.js";

const generateConversationTitle = (message) => {
  const cleaned = (message || "").replace(/\s+/g, " ").trim();

  if (!cleaned) {
    return "New Chat";
  }

  return cleaned.length > 40 ? `${cleaned.slice(0, 40).trimEnd()}...` : cleaned;
};

const sanitizeConversation = (conversation) => ({
  _id: conversation._id,
  userId: conversation.userId,
  title: conversation.title || "New Chat",
  provider: conversation.provider,
  messages: conversation.messages.map((message) => ({
    role: message.role,
    content: message.content,
    createdAt: message.createdAt,
  })),
  createdAt: conversation.createdAt,
  updatedAt: conversation.updatedAt,
});

const createConversationPreview = (conversation) => {
  const lastMessage = conversation.messages[conversation.messages.length - 1];

  return {
    _id: conversation._id,
    title: conversation.title || "New Chat",
    provider: conversation.provider,
    lastMessagePreview: lastMessage?.content?.slice(0, 120) || "",
    updatedAt: conversation.updatedAt,
    createdAt: conversation.createdAt,
  };
};

const validateMessage = (message) => {
  if (!message?.trim()) {
    throw createHttpError(400, "Message is required");
  }
};

const getConversationByIdForUser = async ({ conversationId, userId }) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId,
  });

  if (!conversation) {
    throw createHttpError(404, "Conversation not found");
  }

  return conversation;
};

const appendMessage = (conversation, role, content) => {
  conversation.messages.push({
    role,
    content: content.trim(),
    createdAt: new Date(),
  });
};

export {
  appendMessage,
  createConversationPreview,
  generateConversationTitle,
  getConversationByIdForUser,
  sanitizeConversation,
  validateMessage,
};
