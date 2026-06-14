import Note from "../models/Note.js";
import Task from "../models/Task.js";
import {
  createMemory,
  deleteMemory,
  deleteMemoryByTitle,
  listMemories,
  searchMemories,
} from "./memory.service.js";

const createNoteTool = async (userId, { title, content, tags }) => {
  try {
    const note = new Note({
      userId,
      title: title.trim(),
      content: content.trim(),
      tags: tags || [],
    });
    await note.save();
    return { success: true, note };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const searchNotesTool = async (userId, { query }) => {
  try {
    const notes = await Note.find({
      userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    }).sort({ updatedAt: -1 });
    return { success: true, notes };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const createTaskTool = async (userId, { title, description, dueDate, priority }) => {
  try {
    const task = new Task({
      userId,
      title: title.trim(),
      description: description?.trim() || "",
      dueDate: dueDate || null,
      priority: priority || "medium",
    });
    await task.save();
    return { success: true, task };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const listTasksTool = async (userId, { status }) => {
  try {
    const query = { userId };
    if (status) {
      query.status = status;
    }
    const tasks = await Task.find(query).sort({ dueDate: 1, createdAt: -1 });
    return { success: true, tasks };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const completeTaskTool = async (userId, { taskId, title }) => {
  try {
    const query = { userId };
    if (taskId) {
      query._id = taskId;
    } else if (title) {
      query.title = { $regex: title, $options: "i" };
    } else {
      return { success: false, error: "Either taskId or title is required" };
    }

    const task = await Task.findOne(query);
    if (!task) {
      return { success: false, error: "Task not found" };
    }

    task.status = "completed";
    await task.save();
    return { success: true, task };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const containsSensitiveInfo = (text) => {
  const sensitivePatterns = [
    /\bpassword\s*[:=]\s*\S+/i,
    /\bapi\s*key\s*[:=]\s*\S+/i,
    /\bsecret\s*[:=]\s*\S+/i,
    /\btoken\s*[:=]\s*\S+/i,
    /\bcredit\s*card\s*[:=]\s*\d+/i,
    /\bbank\s*account\s*[:=]\s*\d+/i,
    /\bssn\s*[:=]\s*\d+/i,
    /\bsocial\s*security\s*[:=]\s*\d+/i,
  ];

  return sensitivePatterns.some((pattern) => pattern.test(text));
};

const saveMemoryTool = async (userId, { title, content, category }) => {
  try {
    const combinedText = `${title} ${content}`;
    
    if (containsSensitiveInfo(combinedText)) {
      return {
        success: false,
        error: "I cannot save sensitive information like passwords, API keys, or financial details for security reasons.",
        isSensitive: true,
      };
    }

    const result = await createMemory(userId, { title, content, category });
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const searchMemoryTool = async (userId, { query }) => {
  try {
    const result = await searchMemories(userId, query);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const listMemoriesTool = async (userId, { category }) => {
  try {
    const result = await listMemories(userId, { category });
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const deleteMemoryTool = async (userId, { memoryId, title }) => {
  try {
    if (memoryId) {
      const result = await deleteMemory(userId, memoryId);
      return result;
    } else if (title) {
      const result = await deleteMemoryByTitle(userId, title);
      return result;
    } else {
      return { success: false, error: "Either memoryId or title is required" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export {
  completeTaskTool,
  createNoteTool,
  createTaskTool,
  deleteMemoryTool,
  listMemoriesTool,
  listTasksTool,
  saveMemoryTool,
  searchMemoryTool,
  searchNotesTool,
};
