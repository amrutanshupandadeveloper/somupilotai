import Memory from "../models/Memory.js";
import asyncHandler from "../utils/asyncHandler.js";
import createHttpError from "../utils/createHttpError.js";
import { sendSuccess } from "../utils/response.js";

const createMemory = asyncHandler(async (req, res) => {
  const { title, content, category } = req.body;

  if (!title?.trim()) {
    throw createHttpError(400, "Title is required");
  }

  if (!content?.trim()) {
    throw createHttpError(400, "Content is required");
  }

  const memory = new Memory({
    userId: req.user._id,
    title: title.trim(),
    content: content.trim(),
    category: category || "other",
  });

  await memory.save();

  return sendSuccess(res, "Memory created successfully", memory);
});

const getMemories = asyncHandler(async (req, res) => {
  const { search, category, isActive } = req.query;

  const query = { userId: req.user._id };

  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  if (category) {
    query.category = category;
  }

  if (search) {
    query.$text = { $search: search };
  }

  const memories = await Memory.find(query).sort({ createdAt: -1 });

  return sendSuccess(res, "Memories fetched successfully", memories);
});

const getMemoryById = asyncHandler(async (req, res) => {
  const memory = await Memory.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!memory) {
    throw createHttpError(404, "Memory not found");
  }

  return sendSuccess(res, "Memory fetched successfully", memory);
});

const updateMemory = asyncHandler(async (req, res) => {
  const { title, content, category, isActive } = req.body;

  const memory = await Memory.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!memory) {
    throw createHttpError(404, "Memory not found");
  }

  if (title !== undefined) memory.title = title.trim();
  if (content !== undefined) memory.content = content.trim();
  if (category !== undefined) memory.category = category;
  if (isActive !== undefined) memory.isActive = isActive;

  await memory.save();

  return sendSuccess(res, "Memory updated successfully", memory);
});

const deleteMemory = asyncHandler(async (req, res) => {
  const memory = await Memory.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!memory) {
    throw createHttpError(404, "Memory not found");
  }

  memory.isActive = false;
  await memory.save();

  return sendSuccess(res, "Memory deleted successfully", memory);
});

const restoreMemory = asyncHandler(async (req, res) => {
  const memory = await Memory.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!memory) {
    throw createHttpError(404, "Memory not found");
  }

  memory.isActive = true;
  await memory.save();

  return sendSuccess(res, "Memory restored successfully", memory);
});

export {
  createMemory,
  deleteMemory,
  getMemoryById,
  getMemories,
  restoreMemory,
  updateMemory,
};
