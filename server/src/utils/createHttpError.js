const createHttpError = (statusCode, message, data = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (data !== null) {
    error.data = data;
  }
  return error;
};

export default createHttpError;
