import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import createHttpError from "../utils/createHttpError.js";
import { ensureUserIsActive } from "../services/authService.js";

const authMiddleware = asyncHandler(async (req, _res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw createHttpError(401, "Authorization token is required");
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw createHttpError(401, "Invalid authentication token");
    }

    ensureUserIsActive(user);
    req.user = user;
    next();
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    throw createHttpError(401, "Invalid or expired authentication token");
  }
});

export default authMiddleware;
