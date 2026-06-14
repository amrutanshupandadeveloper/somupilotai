import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["preference", "goal", "profile", "learning", "work", "project", "routine", "other"],
      default: "other",
      index: true,
    },
    source: {
      type: String,
      default: "chat",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

memorySchema.index({ title: "text", content: "text" });

const Memory = mongoose.model("Memory", memorySchema);

export default Memory;
