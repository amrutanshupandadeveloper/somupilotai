import Memory from "../models/Memory.js";

const createMemory = async (userId, data) => {
  try {
    const memory = new Memory({
      userId,
      title: data.title.trim(),
      content: data.content.trim(),
      category: data.category || "other",
      source: data.source || "chat",
    });
    await memory.save();
    return { success: true, memory };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const searchMemories = async (userId, query) => {
  try {
    const memories = await Memory.find({
      userId,
      isActive: true,
      $text: { $search: query },
    }).sort({ createdAt: -1 });
    return { success: true, memories };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const getRelevantMemories = async (userId, userMessage) => {
  try {
    const memories = await Memory.find({
      userId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .limit(10);

    if (memories.length === 0) {
      return { success: true, memories: [] };
    }

    const messageLower = userMessage.toLowerCase();
    const relevantMemories = memories.filter((memory) => {
      const titleLower = memory.title.toLowerCase();
      const contentLower = memory.content.toLowerCase();
      return (
        titleLower.includes(messageLower) ||
        contentLower.includes(messageLower) ||
        messageLower.includes(titleLower) ||
        messageLower.includes(contentLower)
      );
    });

    return { success: true, memories: relevantMemories.slice(0, 5) };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const listMemories = async (userId, filters = {}) => {
  try {
    const query = { userId, isActive: true };
    if (filters.category) {
      query.category = filters.category;
    }
    const memories = await Memory.find(query).sort({ createdAt: -1 });
    return { success: true, memories };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const updateMemory = async (userId, memoryId, data) => {
  try {
    const memory = await Memory.findOne({ _id: memoryId, userId });
    if (!memory) {
      return { success: false, error: "Memory not found" };
    }
    if (data.title !== undefined) memory.title = data.title.trim();
    if (data.content !== undefined) memory.content = data.content.trim();
    if (data.category !== undefined) memory.category = data.category;
    if (data.isActive !== undefined) memory.isActive = data.isActive;
    await memory.save();
    return { success: true, memory };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const deleteMemory = async (userId, memoryId) => {
  try {
    const memory = await Memory.findOne({ _id: memoryId, userId });
    if (!memory) {
      return { success: false, error: "Memory not found" };
    }
    memory.isActive = false;
    await memory.save();
    return { success: true, memory };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const deleteMemoryByTitle = async (userId, title) => {
  try {
    const memory = await Memory.findOne({ userId, title: new RegExp(title, "i"), isActive: true });
    if (!memory) {
      return { success: false, error: "Memory not found" };
    }
    memory.isActive = false;
    await memory.save();
    return { success: true, memory };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export {
  createMemory,
  deleteMemory,
  deleteMemoryByTitle,
  getRelevantMemories,
  listMemories,
  searchMemories,
  updateMemory,
};
