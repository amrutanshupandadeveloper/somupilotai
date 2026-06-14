import Usage, { getNextResetAt, getResetDateKey } from "../models/Usage.js";
import createHttpError from "../utils/createHttpError.js";

const formatDurationPart = (value, label) => `${value}${label}`;

const getTimeUntilReset = (nextResetAt) => {
  const millisecondsRemaining = new Date(nextResetAt).getTime() - Date.now();

  if (millisecondsRemaining <= 0) {
    return "0m";
  }

  const totalMinutes = Math.ceil(millisecondsRemaining / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return formatDurationPart(minutes, "m");
  }

  return `${formatDurationPart(hours, "h")} ${formatDurationPart(minutes, "m")}`;
};

const sanitizeUsage = (usage) => ({
  aiCredits: usage.aiCredits,
  maxAiCredits: usage.maxAiCredits,
  documentCredits: usage.documentCredits,
  maxDocumentCredits: usage.maxDocumentCredits,
  pdfUploadsToday: usage.pdfUploadsToday,
  maxPdfUploadsPerDay: usage.maxPdfUploadsPerDay,
  pictureUploadsToday: usage.pictureUploadsToday,
  maxPictureUploadsPerDay: usage.maxPictureUploadsPerDay,
  videoUploadsToday: usage.videoUploadsToday,
  maxVideoUploadsPerDay: usage.maxVideoUploadsPerDay,
  nextResetAt: usage.nextResetAt,
  lastResetAt: usage.lastResetAt,
  timeUntilReset: getTimeUntilReset(usage.nextResetAt),
  resetIntervalHours: usage.resetIntervalHours,
});

const getOrCreateUsage = async (userId) => {
  const usage = await Usage.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );

  return usage;
};

const resetPdfUploadsIfNeeded = async (usage) => {
  const today = getResetDateKey();

  if (usage.lastPdfResetDate === today) {
    return usage;
  }

  usage.pdfUploadsToday = 0;
  usage.lastPdfResetDate = today;
  await usage.save();
  return usage;
};

const resetMediaUploadsIfNeeded = async (usage) => {
  const today = getResetDateKey();

  if (usage.lastMediaResetDate === today) {
    return usage;
  }

  usage.pictureUploadsToday = 0;
  usage.videoUploadsToday = 0;
  usage.lastMediaResetDate = today;
  await usage.save();
  return usage;
};

const resetCreditsIfNeeded = async (userId) => {
  let usage = await getOrCreateUsage(userId);
  usage = await resetPdfUploadsIfNeeded(usage);
  usage = await resetMediaUploadsIfNeeded(usage);

  const now = new Date();

  if (now < new Date(usage.nextResetAt)) {
    return usage;
  }

  usage.aiCredits = usage.maxAiCredits;
  usage.documentCredits = usage.maxDocumentCredits;
  usage.lastResetAt = now;
  usage.nextResetAt = getNextResetAt(usage.resetIntervalHours);
  await usage.save();

  return usage;
};

const consumeAiCredit = async (userId) => {
  await resetCreditsIfNeeded(userId);

  const usage = await Usage.findOneAndUpdate(
    {
      userId,
      aiCredits: { $gt: 0 },
    },
    {
      $inc: { aiCredits: -1 },
    },
    {
      new: true,
    }
  );

  if (!usage) {
    const latestUsage = await resetCreditsIfNeeded(userId);
    throw createHttpError(429, "AI credits finished. Credits will renew soon.", {
      aiCredits: latestUsage.aiCredits,
      maxAiCredits: latestUsage.maxAiCredits,
      nextResetAt: latestUsage.nextResetAt,
      timeUntilReset: getTimeUntilReset(latestUsage.nextResetAt),
      resetIntervalHours: latestUsage.resetIntervalHours,
    });
  }

  return usage;
};

const consumeDocumentCredit = async (userId) => {
  await resetCreditsIfNeeded(userId);

  const usage = await Usage.findOneAndUpdate(
    {
      userId,
      documentCredits: { $gt: 0 },
    },
    {
      $inc: { documentCredits: -1 },
    },
    {
      new: true,
    }
  );

  if (!usage) {
    const latestUsage = await resetCreditsIfNeeded(userId);
    throw createHttpError(429, "Document credits finished. Credits will renew soon.", {
      nextResetAt: latestUsage.nextResetAt,
      timeUntilReset: getTimeUntilReset(latestUsage.nextResetAt),
    });
  }

  return usage;
};

const consumePdfUpload = async (userId) => {
  await resetCreditsIfNeeded(userId);

  const today = getResetDateKey();
  const currentUsage = await getOrCreateUsage(userId);
  const usage = await Usage.findOneAndUpdate(
    {
      userId,
      pdfUploadsToday: { $lt: currentUsage.maxPdfUploadsPerDay },
      lastPdfResetDate: today,
    },
    {
      $inc: { pdfUploadsToday: 1 },
    },
    {
      new: true,
    }
  );

  if (!usage) {
    const latestUsage = await resetCreditsIfNeeded(userId);
    throw createHttpError(429, "PDF upload limit reached for today.");
  }

  return usage;
};

const consumePictureUpload = async (userId) => {
  await resetCreditsIfNeeded(userId);

  const today = getResetDateKey();
  const currentUsage = await getOrCreateUsage(userId);
  const usage = await Usage.findOneAndUpdate(
    {
      userId,
      pictureUploadsToday: { $lt: currentUsage.maxPictureUploadsPerDay },
      lastMediaResetDate: today,
    },
    {
      $inc: { pictureUploadsToday: 1 },
    },
    {
      new: true,
    }
  );

  if (!usage) {
    throw createHttpError(429, "Picture upload limit reached for today.");
  }

  return usage;
};

const consumeVideoUpload = async (userId) => {
  await resetCreditsIfNeeded(userId);

  const today = getResetDateKey();
  const currentUsage = await getOrCreateUsage(userId);
  const usage = await Usage.findOneAndUpdate(
    {
      userId,
      videoUploadsToday: { $lt: currentUsage.maxVideoUploadsPerDay },
      lastMediaResetDate: today,
    },
    {
      $inc: { videoUploadsToday: 1 },
    },
    {
      new: true,
    }
  );

  if (!usage) {
    throw createHttpError(429, "Video upload limit reached for today.");
  }

  return usage;
};

const resetUsageForDevelopment = async (userId) => {
  const usage = await getOrCreateUsage(userId);

  usage.aiCredits = usage.maxAiCredits;
  usage.documentCredits = usage.maxDocumentCredits;
  usage.pdfUploadsToday = 0;
  usage.pictureUploadsToday = 0;
  usage.videoUploadsToday = 0;
  usage.lastResetAt = new Date();
  usage.nextResetAt = getNextResetAt(usage.resetIntervalHours);
  usage.lastPdfResetDate = getResetDateKey();
  usage.lastMediaResetDate = getResetDateKey();
  await usage.save();

  return usage;
};

export {
  consumeAiCredit,
  consumeDocumentCredit,
  consumePdfUpload,
  consumePictureUpload,
  consumeVideoUpload,
  getOrCreateUsage,
  getTimeUntilReset,
  resetCreditsIfNeeded,
  resetUsageForDevelopment,
  sanitizeUsage,
};
