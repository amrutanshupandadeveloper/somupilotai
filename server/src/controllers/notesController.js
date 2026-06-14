import Note from "../models/Note.js";
import asyncHandler from "../utils/asyncHandler.js";
import createHttpError from "../utils/createHttpError.js";
import { sendSuccess } from "../utils/response.js";

const createNote = asyncHandler(async (req, res) => {
  const { title, content, tags, isPinned } = req.body;

  if (!title?.trim()) {
    throw createHttpError(400, "Title is required");
  }

  if (!content?.trim()) {
    throw createHttpError(400, "Content is required");
  }

  const note = new Note({
    userId: req.user._id,
    title: title.trim(),
    content: content.trim(),
    tags: tags || [],
    isPinned: isPinned || false,
  });

  await note.save();

  return sendSuccess(res, "Note created successfully", note);
});

const getNotes = asyncHandler(async (req, res) => {
  const { search, tag, pinned } = req.query;

  const query = { userId: req.user._id };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  if (tag) {
    query.tags = tag;
  }

  if (pinned === "true") {
    query.isPinned = true;
  }

  const notes = await Note.find(query).sort({ isPinned: -1, updatedAt: -1 });

  return sendSuccess(res, "Notes fetched successfully", notes);
});

const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  return sendSuccess(res, "Note fetched successfully", note);
});

const updateNote = asyncHandler(async (req, res) => {
  const { title, content, tags, isPinned } = req.body;

  const note = await Note.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  if (title !== undefined) note.title = title.trim();
  if (content !== undefined) note.content = content.trim();
  if (tags !== undefined) note.tags = tags;
  if (isPinned !== undefined) note.isPinned = isPinned;

  await note.save();

  return sendSuccess(res, "Note updated successfully", note);
});

const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!note) {
    throw createHttpError(404, "Note not found");
  }

  await note.deleteOne();

  return sendSuccess(res, "Note deleted successfully");
});

export {
  createNote,
  deleteNote,
  getNoteById,
  getNotes,
  updateNote,
};
