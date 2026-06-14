import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { loginUser, registerUser, sanitizeUser } from "../services/authService.js";

const register = asyncHandler(async (req, res) => {
  const authPayload = await registerUser(req.body);

  return sendSuccess(res, "Registration successful", authPayload, 201);
});

const login = asyncHandler(async (req, res) => {
  const authPayload = await loginUser(req.body);

  return sendSuccess(res, "Login successful", authPayload);
});

const getCurrentUser = asyncHandler(async (req, res) =>
  sendSuccess(res, "Authenticated user fetched successfully", sanitizeUser(req.user))
);

const logout = asyncHandler(async (_req, res) =>
  sendSuccess(res, "Logout successful")
);

export { register, login, getCurrentUser, logout };
