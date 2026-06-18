import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import Document from "../models/Document.js";
import { searchRelevantChunks } from "../services/documentSearch.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import createHttpError from "../utils/createHttpError.js";
import { sendSuccess } from "../utils/response.js";
import { generateAiResponse } from "../services/aiProvider.service.js";
import {
  appendMessage,
  createConversationPreview,
  generateConversationTitle,
  getConversationByIdForUser,
  sanitizeConversation,
  validateMessage,
} from "../services/chatService.js";
import {
  consumeAiCredit,
  resetCreditsIfNeeded,
  sanitizeUsage,
} from "../services/usage.service.js";
import {
  completeTaskTool,
  createNoteTool,
  createTaskTool,
  deleteMemoryTool,
  listMemoriesTool,
  listTasksTool,
  saveMemoryTool,
  searchMemoryTool,
  searchNotesTool,
} from "../services/agentTools.service.js";
import { getRelevantMemories, listMemories } from "../services/memory.service.js";
import { needsWebSearch, searchWeb } from "../services/webSearch.service.js";

const detectToolIntent = (message) => {
  const lowerMessage = message.toLowerCase();

  // Note creation patterns
  if (
    lowerMessage.includes("note") &&
    (lowerMessage.includes("save") ||
      lowerMessage.includes("create") ||
      lowerMessage.includes("add") ||
      lowerMessage.includes("karo") ||
      lowerMessage.includes("banao"))
  ) {
    return { tool: "createNote", type: "note" };
  }

  // Note search patterns
  if (
    lowerMessage.includes("note") &&
    (lowerMessage.includes("search") ||
      lowerMessage.includes("find") ||
      lowerMessage.includes("show") ||
      lowerMessage.includes("dikhao"))
  ) {
    return { tool: "searchNotes", type: "note" };
  }

  // Task creation patterns
  if (
    lowerMessage.includes("task") &&
    (lowerMessage.includes("create") ||
      lowerMessage.includes("add") ||
      lowerMessage.includes("bana") ||
      lowerMessage.includes("banao"))
  ) {
    return { tool: "createTask", type: "task" };
  }

  // Task listing patterns
  if (
    (lowerMessage.includes("task") || lowerMessage.includes("tasks")) &&
    (lowerMessage.includes("show") ||
      lowerMessage.includes("list") ||
      lowerMessage.includes("dikhao") ||
      lowerMessage.includes("pending"))
  ) {
    return { tool: "listTasks", type: "task" };
  }

  // Task completion patterns
  if (
    lowerMessage.includes("task") &&
    (lowerMessage.includes("complete") ||
      lowerMessage.includes("done") ||
      lowerMessage.includes("finish"))
  ) {
    return { tool: "completeTask", type: "task" };
  }

  // Memory save patterns
  if (
    (lowerMessage.includes("remember") ||
      lowerMessage.includes("save") ||
      lowerMessage.includes("yaad") ||
      lowerMessage.includes("memory")) &&
    (lowerMessage.includes("that") ||
      lowerMessage.includes("this") ||
      lowerMessage.includes("from now on") ||
      lowerMessage.includes("isko") ||
      lowerMessage.includes("note this"))
  ) {
    return { tool: "saveMemory", type: "memory" };
  }

  // Memory search/list patterns
  if (
    (lowerMessage.includes("what") && lowerMessage.includes("remember")) ||
    (lowerMessage.includes("show") && lowerMessage.includes("memory")) ||
    (lowerMessage.includes("list") && lowerMessage.includes("memory")) ||
    lowerMessage.includes("my memories") ||
    lowerMessage.includes("saved goals")
  ) {
    return { tool: "listMemories", type: "memory" };
  }

  // Memory forget/delete patterns
  if (
    (lowerMessage.includes("forget") ||
      lowerMessage.includes("delete") ||
      lowerMessage.includes("remove")) &&
    (lowerMessage.includes("memory") ||
      lowerMessage.includes("that") ||
      lowerMessage.includes("this"))
  ) {
    return { tool: "deleteMemory", type: "memory" };
  }

  return null;
};

const extractNoteContent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Try to extract content after keywords like "note save karo:", "note:", etc.
  const patterns = [
    /note\s+(?:save|create|add|karo|banao)[:\s]+(.+)/i,
    /save\s+note[:\s]+(.+)/i,
    /create\s+note[:\s]+(.+)/i,
    /note[:\s]+(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return { title: match[1].trim().substring(0, 200), content: match[1].trim() };
    }
  }

  // Fallback: use the whole message as content
  return { title: message.substring(0, 200), content: message };
};

const extractTaskContent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Try to extract title after keywords
  const patterns = [
    /task\s+(?:create|add|bana|banao)[:\s]+(.+)/i,
    /create\s+task[:\s]+(.+)/i,
    /task[:\s]+(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return { title: match[1].trim().substring(0, 200), description: "" };
    }
  }

  // Fallback: use the whole message as title
  return { title: message.substring(0, 200), description: "" };
};

const extractMemoryContent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Try to extract content after keywords
  const patterns = [
    /remember\s+(?:that|this)[:\s]+(.+)/i,
    /save\s+(?:this|that)[:\s]+(.+)/i,
    /yaad\s+(?:rakhna|karlo)[:\s]+(.+)/i,
    /memory\s+(?:save|store)[:\s]+(.+)/i,
    /note\s+this\s+(?:as\s+memory)?[:\s]+(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const content = match[1].trim();
      return {
        title: content.substring(0, 200),
        content: content,
        category: "preference",
      };
    }
  }

  // Fallback: use the whole message as content
  return {
    title: message.substring(0, 200),
    content: message,
    category: "preference",
  };
};

const extractForgetTarget = (message) => {
  const lowerMessage = message.toLowerCase();
  
  const patterns = [
    /forget\s+(?:that|this|the)?\s*(.+)/i,
    /delete\s+(?:this|that|the)?\s*(.+)/i,
    /remove\s+(?:this|that|the)?\s*(.+)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
};

const sendMessage = asyncHandler(async (req, res) => {
  const {
    message,
    conversationId,
    model,
    selectedProvider,
    selectedModelLevel,
    selectedModel,
    documentId,
  } = req.body;

  validateMessage(message);
  const usage = await resetCreditsIfNeeded(req.user._id);

  if (usage.aiCredits <= 0) {
    throw createHttpError(429, "AI credits finished. Credits will renew soon.", {
      aiCredits: usage.aiCredits,
      maxAiCredits: usage.maxAiCredits,
      nextResetAt: usage.nextResetAt,
      timeUntilReset: sanitizeUsage(usage).timeUntilReset,
      resetIntervalHours: usage.resetIntervalHours,
      usage: sanitizeUsage(usage),
    });
  }

  // Fetch user profile (name, email only - no sensitive data)
  const user = await User.findById(req.user._id).select("name email role");

  if (process.env.NODE_ENV === "development") {
    console.log("Profile injected:", !!user?.name);
  }

  let attachedDocument = null;
  if (documentId) {
    attachedDocument = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
    });

    if (!attachedDocument) {
      throw createHttpError(404, "Attached PDF was not found");
    }
  }

  let conversation;
  const trimmedMessage = message.trim();
  const requestedProvider = selectedProvider
    ? String(selectedProvider).trim().toLowerCase()
    : model
      ? String(model).trim().toLowerCase()
      : "auto";
  const provider = requestedProvider || (process.env.AI_PROVIDER || "auto").toLowerCase();

  if (process.env.NODE_ENV === "development") {
    console.log("Provider selected:", requestedProvider || "auto");
    console.log("Calling OpenRouter:", requestedProvider === "openrouter");
    console.log("Model:", process.env.OPENROUTER_MODEL || process.env.AI_MODEL || "");
    console.log("Key exists:", !!process.env.OPENROUTER_API_KEY);
  }

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

  // Detect tool intent
  const toolIntent = detectToolIntent(trimmedMessage);
  let toolResult = null;
  let assistantReply = "";
  let providerUsed = "";
  let providerModel = "";
  let providerPreset = "";
  let sources = [];
  let webSearchWarning = "";
  let toolMetadata = {
    toolUsed: false,
    toolName: "",
    toolStatus: "",
  };

  if (toolIntent) {
    // Execute tool action
    switch (toolIntent.tool) {
      case "createNote": {
        const noteContent = extractNoteContent(trimmedMessage);
        toolResult = await createNoteTool(req.user._id, noteContent);
        if (toolResult.success) {
          assistantReply = "Note saved successfully.";
          toolMetadata = {
            toolUsed: true,
            toolName: "createNoteTool",
            toolStatus: "success",
          };
        } else {
          assistantReply = `Failed to save note: ${toolResult.error}`;
          toolMetadata = {
            toolUsed: true,
            toolName: "createNoteTool",
            toolStatus: "error",
          };
        }
        break;
      }
      case "searchNotes": {
        const query = trimmedMessage.replace(/note\s+(?:search|find|show|dikhao)[:\s]*/i, "").trim();
        toolResult = await searchNotesTool(req.user._id, { query: query || "" });
        if (toolResult.success) {
          if (toolResult.notes.length === 0) {
            assistantReply = "No notes found.";
          } else {
            const noteList = toolResult.notes.map(n => `- ${n.title}`).join("\n");
            assistantReply = `Found ${toolResult.notes.length} note(s):\n${noteList}`;
          }
          toolMetadata = {
            toolUsed: true,
            toolName: "searchNotesTool",
            toolStatus: "success",
          };
        } else {
          assistantReply = `Failed to search notes: ${toolResult.error}`;
          toolMetadata = {
            toolUsed: true,
            toolName: "searchNotesTool",
            toolStatus: "error",
          };
        }
        break;
      }
      case "createTask": {
        const taskContent = extractTaskContent(trimmedMessage);
        toolResult = await createTaskTool(req.user._id, taskContent);
        if (toolResult.success) {
          assistantReply = "Task created successfully.";
          toolMetadata = {
            toolUsed: true,
            toolName: "createTaskTool",
            toolStatus: "success",
          };
        } else {
          assistantReply = `Failed to create task: ${toolResult.error}`;
          toolMetadata = {
            toolUsed: true,
            toolName: "createTaskTool",
            toolStatus: "error",
          };
        }
        break;
      }
      case "listTasks": {
        const status = trimmedMessage.includes("pending") ? "pending" : null;
        toolResult = await listTasksTool(req.user._id, { status });
        if (toolResult.success) {
          if (toolResult.tasks.length === 0) {
            assistantReply = "No tasks found.";
          } else {
            const taskList = toolResult.tasks.map(t => `- ${t.title} (${t.priority})`).join("\n");
            assistantReply = `Found ${toolResult.tasks.length} task(s):\n${taskList}`;
          }
          toolMetadata = {
            toolUsed: true,
            toolName: "listTasksTool",
            toolStatus: "success",
          };
        } else {
          assistantReply = `Failed to list tasks: ${toolResult.error}`;
          toolMetadata = {
            toolUsed: true,
            toolName: "listTasksTool",
            toolStatus: "error",
          };
        }
        break;
      }
      case "completeTask": {
        const taskTitle = trimmedMessage.replace(/task\s+(?:complete|done|finish)[:\s]*/i, "").trim();
        toolResult = await completeTaskTool(req.user._id, { title: taskTitle });
        if (toolResult.success) {
          assistantReply = "Task completed successfully.";
          toolMetadata = {
            toolUsed: true,
            toolName: "completeTaskTool",
            toolStatus: "success",
          };
        } else {
          assistantReply = `Failed to complete task: ${toolResult.error}`;
          toolMetadata = {
            toolUsed: true,
            toolName: "completeTaskTool",
            toolStatus: "error",
          };
        }
        break;
      }
      case "saveMemory": {
        const memoryContent = extractMemoryContent(trimmedMessage);
        toolResult = await saveMemoryTool(req.user._id, memoryContent);
        if (toolResult.success) {
          assistantReply = "Got it, I'll remember that.";
          toolMetadata = {
            toolUsed: true,
            toolName: "saveMemoryTool",
            toolStatus: "success",
          };
        } else {
          if (toolResult.isSensitive) {
            assistantReply = toolResult.error;
          } else {
            assistantReply = `Failed to save memory: ${toolResult.error}`;
          }
          toolMetadata = {
            toolUsed: true,
            toolName: "saveMemoryTool",
            toolStatus: "error",
          };
        }
        break;
      }
      case "listMemories": {
        const category = trimmedMessage.includes("goal") ? "goal" : null;
        toolResult = await listMemoriesTool(req.user._id, { category });
        if (toolResult.success) {
          if (toolResult.memories.length === 0) {
            assistantReply = "I don't have any memories saved about you yet.";
          } else {
            const memoryList = toolResult.memories.map(m => `- ${m.title} (${m.category})`).join("\n");
            assistantReply = `Here's what I remember about you:\n${memoryList}`;
          }
          toolMetadata = {
            toolUsed: true,
            toolName: "listMemoriesTool",
            toolStatus: "success",
          };
        } else {
          assistantReply = `Failed to list memories: ${toolResult.error}`;
          toolMetadata = {
            toolUsed: true,
            toolName: "listMemoriesTool",
            toolStatus: "error",
          };
        }
        break;
      }
      case "deleteMemory": {
        const target = extractForgetTarget(trimmedMessage);
        toolResult = await deleteMemoryTool(req.user._id, { title: target });
        if (toolResult.success) {
          assistantReply = "I've forgotten that memory.";
          toolMetadata = {
            toolUsed: true,
            toolName: "deleteMemoryTool",
            toolStatus: "success",
          };
        } else {
          assistantReply = `Failed to forget memory: ${toolResult.error}`;
          toolMetadata = {
            toolUsed: true,
            toolName: "deleteMemoryTool",
            toolStatus: "error",
          };
        }
        break;
      }
      default:
        break;
    }
  }

  // If no tool was used, proceed with normal AI chat
  if (!toolIntent) {
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

    // Fetch relevant memories for context
    let memoryResult = await getRelevantMemories(req.user._id, trimmedMessage);

    // Fallback: if no relevant memories found, include latest 5-8 active memories
    if (!memoryResult.success || memoryResult.memories.length === 0) {
      const latestMemoriesResult = await listMemories(req.user._id);
      if (latestMemoriesResult.success && latestMemoriesResult.memories.length > 0) {
        memoryResult = {
          success: true,
          memories: latestMemoriesResult.memories.slice(0, 8),
        };
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Memories injected:", memoryResult.success ? memoryResult.memories.length : 0);
    }

    // Build system prompt with user profile and memories
    let systemPrompt = `You are SomuPilot, a helpful personal AI assistant.\n\n`;

    if (user) {
      systemPrompt += `Current logged-in user profile:\n`;
      systemPrompt += `Name: ${user.name}\n`;
      systemPrompt += `Email: ${user.email}\n\n`;
    }

    if (memoryResult.success && memoryResult.memories.length > 0) {
      const memoryText = memoryResult.memories
        .map((m) => `- ${m.title}: ${m.content} (${m.category})`)
        .join("\n");
      systemPrompt += `Relevant saved memories:\n${memoryText}\n\n`;

      // Add memory used indicator to metadata
      toolMetadata = {
        toolUsed: true,
        toolName: "memoryContext",
        toolStatus: "success",
      };
    }

    if (attachedDocument) {
      const relevantChunks = searchRelevantChunks(attachedDocument.chunks, trimmedMessage, 5);
      const chunksText = relevantChunks
        .map((chunk, idx) => `[Chunk ${idx + 1}]: ${chunk.text}`)
        .join("\n\n");

      systemPrompt += `Relevant context from the uploaded PDF "${attachedDocument.originalName}":\n${chunksText}\n\n`;
      systemPrompt += `Rules for document QA:\n`;
      systemPrompt += `- Rely heavily on the context from the uploaded PDF to answer the question.\n`;
      systemPrompt += `- If the PDF doesn't contain the answer but it's general knowledge, you may still answer but mention it's outside the PDF.\n\n`;
    }

    const shouldUseWebSearch = needsWebSearch(trimmedMessage);

    if (shouldUseWebSearch) {
      const webSearchResult = await searchWeb(trimmedMessage);

      if (webSearchResult.success && webSearchResult.sources.length > 0) {
        sources = webSearchResult.sources.slice(0, 5);
        const webSourceContext = sources
          .map(
            (source, index) =>
              `[Source ${index + 1}] ${source.title}\nURL: ${source.url}\nSnippet: ${source.snippet}`
          )
          .join("\n\n");

        systemPrompt += `\nLive web search sources:\n${webSourceContext}\n\n`;
        systemPrompt += "When using web search context, cite the source domains naturally in the answer when helpful.\n";
        toolMetadata = {
          toolUsed: true,
          toolName: "web_search",
          toolStatus: "success",
        };
      } else if (webSearchResult.message) {
        webSearchWarning = "Web search could not complete, so I answered without live sources.";
      }
    }

    systemPrompt += `Rules:\n`;
    systemPrompt += `- If the user asks their name, answer from the user profile.\n`;
    systemPrompt += `- If the user asks what you remember, answer using saved memories.\n`;
    systemPrompt += `- Do not say you do not know if the answer exists in profile or memories.\n`;
    systemPrompt += `- Do not invent facts not present in profile or memories.\n`;
    systemPrompt += `- For general answers, use short headings and clean bullet points when helpful.\n`;
    systemPrompt += `- For coding answers, explain briefly and then provide fenced code blocks with language names.\n`;
    systemPrompt += `- Use helpful icons like ✅, 📌, ⚠️, 💡 only when they improve readability.\n`;

    try {
      const messagesWithContext = [
        {
          role: "system",
          content: systemPrompt,
        },
        ...pendingMessages,
      ];

      const aiResponse = await generateAiResponse({
        messages: messagesWithContext,
        systemPrompt,
        overrideProvider: requestedProvider,
        overrideModel: selectedModel,
        selectedModelLevel,
      });
      assistantReply = aiResponse.text;
      if (webSearchWarning) {
        assistantReply = `${webSearchWarning}\n\n${assistantReply}`;
      }
      providerUsed = aiResponse.provider;
      providerModel = aiResponse.model;
      providerPreset = aiResponse.preset || "";
      conversation.provider = providerUsed || provider;
    } catch (error) {
      const currentUsage = await resetCreditsIfNeeded(req.user._id);

      if (process.env.NODE_ENV === "development") {
        console.log("AI credits deducted:", false);
      }

      if (error.statusCode) {
        throw createHttpError(error.statusCode, error.message, {
          ...(error.data || {}),
          usage: sanitizeUsage(currentUsage),
        });
      }

      throw createHttpError(503, "AI service is temporarily unavailable. Please try again.", {
        errorType: "service_unavailable",
        usage: sanitizeUsage(currentUsage),
      });
    }
  }

  const updatedUsage = toolIntent
    ? usage
    : await consumeAiCredit(req.user._id);

  if (process.env.NODE_ENV === "development" && !toolIntent) {
    console.log("AI credits deducted:", true);
  }
  
  // Append user message
  conversation.messages.push({
    role: "user",
    content: trimmedMessage,
    documentId: documentId || null,
    documentName: attachedDocument ? attachedDocument.originalName : "",
    createdAt: new Date(),
  });

  // Append assistant message with tool metadata
  conversation.messages.push({
    role: "assistant",
    content: assistantReply,
    createdAt: new Date(),
    toolUsed: toolMetadata.toolUsed,
    toolName: toolMetadata.toolName,
    toolStatus: toolMetadata.toolStatus,
    providerUsed,
    providerModel,
    providerPreset,
    sources,
  });

  await conversation.save();

  return sendSuccess(res, "Message sent successfully", {
    conversationId: conversation._id,
    assistantMessage: {
      role: "assistant",
      content: assistantReply,
      createdAt: conversation.messages[conversation.messages.length - 1].createdAt,
      toolUsed: toolMetadata.toolUsed,
      toolName: toolMetadata.toolName,
      toolStatus: toolMetadata.toolStatus,
      providerUsed,
      providerModel,
      providerPreset,
      sources,
    },
    conversation: sanitizeConversation(conversation),
    usage: sanitizeUsage(updatedUsage),
    providerUsed,
  });
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

const toggleConversationPin = asyncHandler(async (req, res) => {
  const conversation = await getConversationByIdForUser({
    conversationId: req.params.id,
    userId: req.user._id,
  });

  conversation.isPinned = !conversation.isPinned;
  conversation.pinnedAt = conversation.isPinned ? new Date() : null;
  await conversation.save();

  return sendSuccess(
    res,
    conversation.isPinned ? "Conversation pinned successfully" : "Conversation unpinned successfully",
    createConversationPreview(conversation)
  );
});

export {
  deleteConversation,
  getConversation,
  getConversations,
  sendMessage,
  toggleConversationPin,
  updateConversationTitle,
};
