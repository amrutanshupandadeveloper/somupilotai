import Document from "../models/Document.js";
import asyncHandler from "../utils/asyncHandler.js";
import createHttpError from "../utils/createHttpError.js";
import { sendSuccess } from "../utils/response.js";
import { generateAiReply } from "../services/aiProvider.service.js";
import {
  consumeDocumentCredit,
  consumePdfUpload,
  resetCreditsIfNeeded,
  sanitizeUsage,
} from "../services/usage.service.js";
import { searchRelevantChunks } from "../services/documentSearch.service.js";
import fs from "fs";
import path from "path";
import pdf from "pdf-parse";

const chunkText = (text, wordsPerChunk = 600, overlapWords = 100) => {
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const chunks = [];
  
  for (let i = 0; i < words.length; i += wordsPerChunk - overlapWords) {
    const chunkWords = words.slice(i, i + wordsPerChunk);
    const chunkText = chunkWords.join(" ");
    
    if (chunkText.trim().length > 0) {
      chunks.push({
        index: chunks.length,
        text: chunkText.trim(),
        wordCount: chunkWords.length,
      });
    }
  }
  
  return chunks;
};

const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw createHttpError(400, "No file uploaded");
  }

  const { originalname, mimetype, size, filename } = req.file;

  if (mimetype !== "application/pdf") {
    fs.unlinkSync(req.file.path);
    throw createHttpError(400, "Only PDF files are allowed");
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (size > maxSize) {
    fs.unlinkSync(req.file.path);
    throw createHttpError(400, "File size exceeds 5MB limit");
  }

  const usage = await resetCreditsIfNeeded(req.user._id);

  if (usage.pdfUploadsToday >= usage.maxPdfUploadsPerDay) {
    fs.unlinkSync(req.file.path);
    throw createHttpError(429, "Daily PDF upload limit reached", {
      pdfUploadsToday: usage.pdfUploadsToday,
      maxPdfUploadsPerDay: usage.maxPdfUploadsPerDay,
      nextResetAt: usage.nextResetAt,
    });
  }

  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdf(dataBuffer);
    const extractedText = data.text;

    if (!extractedText || extractedText.trim().length === 0) {
      fs.unlinkSync(req.file.path);
      throw createHttpError(400, "Could not extract text from PDF");
    }

    const chunks = chunkText(extractedText);

    const document = new Document({
      userId: req.user._id,
      fileName: filename,
      originalName: originalname,
      fileSize: size,
      mimeType: mimetype,
      extractedText: extractedText,
      chunks: chunks,
      uploadedAt: new Date(),
    });

    await document.save();

    // Consume PDF upload credit
    await consumePdfUpload(req.user._id);

    fs.unlinkSync(req.file.path);

    const updatedUsage = await resetCreditsIfNeeded(req.user._id);

    return sendSuccess(res, "Document uploaded successfully", {
      _id: document._id,
      fileName: document.fileName,
      originalName: document.originalName,
      fileSize: document.fileSize,
      chunksCount: document.chunks.length,
      uploadedAt: document.uploadedAt,
      usage: sanitizeUsage(updatedUsage),
    });
  } catch (error) {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw createHttpError(500, "Failed to process PDF: " + error.message);
  }
});

const getDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find({ userId: req.user._id })
    .select("fileName originalName fileSize chunks uploadedAt createdAt")
    .sort({ uploadedAt: -1 });

  return sendSuccess(res, "Documents fetched successfully", documents);
});

const getDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!document) {
    throw createHttpError(404, "Document not found");
  }

  return sendSuccess(res, "Document fetched successfully", {
    _id: document._id,
    fileName: document.fileName,
    originalName: document.originalName,
    fileSize: document.fileSize,
    chunksCount: document.chunks.length,
    uploadedAt: document.uploadedAt,
    createdAt: document.createdAt,
  });
});

const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!document) {
    throw createHttpError(404, "Document not found");
  }

  await document.deleteOne();

  return sendSuccess(res, "Document deleted successfully");
});

const askDocument = asyncHandler(async (req, res) => {
  const { question } = req.body;

  if (!question || !question.trim()) {
    throw createHttpError(400, "Question is required");
  }

  const document = await Document.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!document) {
    throw createHttpError(404, "Document not found");
  }

  const usage = await resetCreditsIfNeeded(req.user._id);

  if (usage.documentCredits <= 0) {
    throw createHttpError(429, "Document credits finished", {
      documentCredits: usage.documentCredits,
      maxDocumentCredits: usage.maxDocumentCredits,
      nextResetAt: usage.nextResetAt,
    });
  }

  const relevantChunks = searchRelevantChunks(document.chunks, question, 5);

  const chunksText = relevantChunks
    .map((chunk, index) => `[Chunk ${index + 1}]: ${chunk.text}`)
    .join("\n\n");

  const systemPrompt = `You are SomuPilot, a personal AI assistant. Answer the user's question using only the provided document context. If the answer is not found in the context, say that the document does not clearly contain the answer.

Document: ${document.originalName}

Context:
${chunksText}

Rules:
- Answer based only on the provided document context.
- If the context doesn't contain the answer, state that clearly.
- Do not use outside knowledge or make assumptions.
- Be concise and direct.`;

  try {
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ];

    const answer = await generateAiReply({ messages });

    const updatedUsage = await consumeDocumentCredit(req.user._id);

    return sendSuccess(res, "Answer generated successfully", {
      answer,
      sources: relevantChunks.map((chunk) => ({
        index: chunk.index,
        text: chunk.text.substring(0, 200) + "...",
      })),
      usage: sanitizeUsage(updatedUsage),
    });
  } catch (error) {
    if (error.statusCode) {
      throw createHttpError(error.statusCode, error.message, error.data || null);
    }
    throw createHttpError(503, "AI service is temporarily unavailable.");
  }
});

export {
  askDocument,
  deleteDocument,
  getDocument,
  getDocuments,
  uploadDocument,
};
