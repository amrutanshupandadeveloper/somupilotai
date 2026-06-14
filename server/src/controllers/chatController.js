import Conversation from "../models/Conversation.js";
import asyncHandler from "../utils/asyncHandler.js";
import createHttpError from "../utils/createHttpError.js";
import { sendSuccess } from "../utils/response.js";
import { generateAiReply } from "../services/aiProvider.service.js";
import {
  appendMessage,
  createConversationPreview,
  generateConversationTitle,
  getConversationByIdForUser,
  sanitizeConversation,
  validateMessage,
} from "../services/chatService.js";

const sendMessage = asyncHandler(async (req, res) => {
  const { message, conversationId } = req.body;

  validateMessage(message);

  let conversation;
  const trimmedMessage = message.trim();
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();

  if (conversationId) {
    conversation = await getConversationByIdForUser({
      conversationId,
      userId: req.user._id,
    });
  } else {
    conversation = new Conversation({
      userId: req.user._id,
      title: generateConversationTitle(trimmedMessage),
      provider,
      messages: [],
    });
  }

  const pendingMessages = [
    ...conversation.messages.map((existingMessage) => ({
      role: existingMessage.role,
      content: existingMessage.content,
      createdAt: existingMessage.createdAt,
    })),
    {
      role: "user",
      content: trimmedMessage,
      createdAt: new Date(),
    },
  ];

  try {
    const assistantReply = await generateAiReply({
      messages: pendingMessages,
    });

    appendMessage(conversation, "user", trimmedMessage);
    appendMessage(conversation, "assistant", assistantReply);
    await conversation.save();

    return sendSuccess(res, "Message sent successfully", {
      conversationId: conversation._id,
      assistantMessage: {
        role: "assistant",
        content: assistantReply,
        createdAt: conversation.messages[conversation.messages.length - 1].createdAt,
      },
      conversation: sanitizeConversation(conversation),
    });
  } catch (error) {
    if (error.statusCode) {
      throw createHttpError(error.statusCode, error.message);
    }

    throw createHttpError(503, "AI service is temporarily unavailable.");
  }
});

const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ userId: req.user._id }).sort({
    updatedAt: -1,
  });

  return sendSuccess(
    res,
    "Conversations fetched successfully",
    conversations.map(createConversationPreview)
  );
});

const getConversation = asyncHandler(async (req, res) => {
  const conversation = await getConversationByIdForUser({
    conversationId: req.params.id,
    userId: req.user._id,
  });

  return sendSuccess(
    res,
    "Conversation fetched successfully",
    sanitizeConversation(conversation)
  );
});

const deleteConversation = asyncHandler(async (req, res) => {
  const conversation = await getConversationByIdForUser({
    conversationId: req.params.id,
    userId: req.user._id,
  });

  await conversation.deleteOne();

  return sendSuccess(res, "Conversation deleted successfully");
});

const updateConversationTitle = asyncHandler(async (req, res) => {
  const title = req.body?.title?.trim();

  if (!title) {
    throw createHttpError(400, "Title is required");
  }

  const conversation = await getConversationByIdForUser({
    conversationId: req.params.id,
    userId: req.user._id,
  });

  conversation.title = title.slice(0, 120);
  await conversation.save();

  return sendSuccess(
    res,
    "Conversation title updated successfully",
    createConversationPreview(conversation)
  );
});

export {
  deleteConversation,
  getConversation,
  getConversations,
  sendMessage,
  updateConversationTitle,
};
