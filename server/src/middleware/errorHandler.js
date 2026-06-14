import { sendError } from "../utils/response.js";

const notFoundHandler = (_req, _res, next) => {
  const error = new Error("Route not found");
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  if (error.name === "ValidationError") {
    return sendError(res, error.message, 400);
  }

  if (error.code === 11000) {
    return sendError(res, "An account with this email already exists", 409);
  }

  return sendError(
    res,
    statusCode === 500 ? "Internal server error" : error.message,
    statusCode
  );
};

export { notFoundHandler, errorHandler };
