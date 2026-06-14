import mongoose from "mongoose";

const getResetDateKey = () => new Date().toISOString().slice(0, 10);

const getNextResetAt = (hours = 6) => {
  const nextResetAt = new Date();
  nextResetAt.setHours(nextResetAt.getHours() + hours);
  return nextResetAt;
};

const usageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    aiCredits: {
      type: Number,
      default: 20,
      min: 0,
    },
    maxAiCredits: {
      type: Number,
      default: 20,
      min: 1,
    },
    documentCredits: {
      type: Number,
      default: 5,
      min: 0,
    },
    maxDocumentCredits: {
      type: Number,
      default: 5,
      min: 1,
    },
    pdfUploadsToday: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxPdfUploadsPerDay: {
      type: Number,
      default: 3,
      min: 1,
    },
    pictureUploadsToday: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxPictureUploadsPerDay: {
      type: Number,
      default: 7,
      min: 1,
    },
    videoUploadsToday: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxVideoUploadsPerDay: {
      type: Number,
      default: 3,
      min: 1,
    },
    resetIntervalHours: {
      type: Number,
      default: 6,
      min: 1,
    },
    nextResetAt: {
      type: Date,
      default: () => getNextResetAt(6),
    },
    lastResetAt: {
      type: Date,
      default: Date.now,
    },
    lastPdfResetDate: {
      type: String,
      default: getResetDateKey,
    },
    lastMediaResetDate: {
      type: String,
      default: getResetDateKey,
    },
  },
  {
    timestamps: true,
  }
);

const Usage = mongoose.model("Usage", usageSchema);

export { getNextResetAt, getResetDateKey };
export default Usage;
