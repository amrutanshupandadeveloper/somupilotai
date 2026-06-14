import Task from "../models/Task.js";
import asyncHandler from "../utils/asyncHandler.js";
import createHttpError from "../utils/createHttpError.js";
import { sendSuccess } from "../utils/response.js";

const createTask = asyncHandler(async (req, res) => {
  const { title, description, dueDate, priority } = req.body;

  if (!title?.trim()) {
    throw createHttpError(400, "Title is required");
  }

  const task = new Task({
    userId: req.user._id,
    title: title.trim(),
    description: description?.trim() || "",
    dueDate: dueDate || null,
    priority: priority || "medium",
  });

  await task.save();

  return sendSuccess(res, "Task created successfully", task);
});

const getTasks = asyncHandler(async (req, res) => {
  const { status, priority, dueDate } = req.query;

  const query = { userId: req.user._id };

  if (status) {
    query.status = status;
  }

  if (priority) {
    query.priority = priority;
  }

  if (dueDate) {
    const date = new Date(dueDate);
    query.dueDate = {
      $gte: date,
      $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
    };
  }

  const tasks = await Task.find(query).sort({ dueDate: 1, createdAt: -1 });

  return sendSuccess(res, "Tasks fetched successfully", tasks);
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!task) {
    throw createHttpError(404, "Task not found");
  }

  return sendSuccess(res, "Task fetched successfully", task);
});

const updateTask = asyncHandler(async (req, res) => {
  const { title, description, dueDate, priority, status } = req.body;

  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!task) {
    throw createHttpError(404, "Task not found");
  }

  if (title !== undefined) task.title = title.trim();
  if (description !== undefined) task.description = description.trim();
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (priority !== undefined) task.priority = priority;
  if (status !== undefined) task.status = status;

  await task.save();

  return sendSuccess(res, "Task updated successfully", task);
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!task) {
    throw createHttpError(404, "Task not found");
  }

  await task.deleteOne();

  return sendSuccess(res, "Task deleted successfully");
});

const completeTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!task) {
    throw createHttpError(404, "Task not found");
  }

  task.status = "completed";
  await task.save();

  return sendSuccess(res, "Task completed successfully", task);
});

const reopenTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!task) {
    throw createHttpError(404, "Task not found");
  }

  task.status = "pending";
  await task.save();

  return sendSuccess(res, "Task reopened successfully", task);
});

export {
  completeTask,
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  reopenTask,
  updateTask,
};
