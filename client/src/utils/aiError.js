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
  const errorType = responseData?.errorType;
  const provider = responseData?.provider || responseData?.data?.provider;

  let baseMessage = responseData?.message || fallbackMessage;

  if (provider === "openrouter" && errorType === "model") {
    baseMessage = "Selected OpenRouter model is not available. Try another free model.";
  } else if (provider === "openrouter" && errorType === "auth") {
    baseMessage = "OpenRouter API key is invalid or missing.";
  } else if (provider === "openrouter" && errorType === "billing") {
    baseMessage = "This OpenRouter model may require credits. Please choose a free model.";
  } else if (provider === "openrouter" && errorType === "provider_rate_limit") {
    baseMessage = "OpenRouter free model is temporarily rate-limited. Your SomuPilot credits were not used.";
  } else if (provider === "openrouter" && errorType === "quota") {
    baseMessage = "OpenRouter limit reached. Please try again later.";
  }

  const retryHint = formatRetryHint(responseData?.retryAfterSeconds);

  return retryHint ? `${baseMessage} ${retryHint}` : baseMessage;
};

export { getFriendlyAiErrorMessage };
