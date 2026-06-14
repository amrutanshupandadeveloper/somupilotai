const formatRetryHint = (retryAfterSeconds) => {
  if (!retryAfterSeconds || retryAfterSeconds <= 0) {
    return "";
  }

  const totalMinutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));

  if (totalMinutes < 60) {
    return `Try again in about ${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}.`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `Try again in about ${hours} hour${hours === 1 ? "" : "s"}.`;
  }

  return `Try again in about ${hours}h ${minutes}m.`;
};

const getFriendlyAiErrorMessage = (apiError, fallbackMessage) => {
  const responseData = apiError?.response?.data;
  const baseMessage = responseData?.message || fallbackMessage;
  const retryHint = formatRetryHint(responseData?.retryAfterSeconds);

  return retryHint ? `${baseMessage} ${retryHint}` : baseMessage;
};

export { getFriendlyAiErrorMessage };
