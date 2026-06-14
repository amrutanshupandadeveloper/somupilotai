const formatTimeUntilReset = (nextResetAt) => {
  if (!nextResetAt) {
    return "0m";
  }

  const difference = new Date(nextResetAt).getTime() - Date.now();

  if (difference <= 0) {
    return "0m";
  }

  const totalSeconds = Math.ceil(difference / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
};

const getUsageToneClasses = (credits) => {
  if (credits <= 0) {
    return "border-rose-400/20 bg-rose-400/10 text-rose-200";
  }

  if (credits <= 5) {
    return "border-amber-400/20 bg-amber-400/10 text-amber-200";
  }

  return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
};

export { formatTimeUntilReset, getUsageToneClasses };
