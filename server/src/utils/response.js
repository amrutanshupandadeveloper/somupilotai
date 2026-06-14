const sendSuccess = (res, message, data = null, statusCode = 200) => {
  const payload = {
    success: true,
    message,
  };

  if (data !== null) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
};

const sendError = (res, message, statusCode = 500, data = null) => {
  const payload = {
    success: false,
    message,
  };

  if (data !== null) {
    if (data.errorType) {
      payload.errorType = data.errorType;
    }

    if (typeof data.retryAfterSeconds === "number") {
      payload.retryAfterSeconds = data.retryAfterSeconds;
    }

    if (data.usage) {
      payload.usage = data.usage;
    }

    const { errorType, retryAfterSeconds, usage, ...rest } = data;

    if (Object.keys(rest).length > 0) {
      payload.data = rest;
    }
  }

  return res.status(statusCode).json(payload);
};

export { sendSuccess, sendError };
