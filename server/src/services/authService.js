import bcrypt from "bcryptjs";
import User from "../models/User.js";
import createHttpError from "../utils/createHttpError.js";
import generateToken from "../utils/token.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatarUrl: user.avatarUrl || "",
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const validateRegisterInput = ({ name, email, password }) => {
  if (!name?.trim()) {
    throw createHttpError(400, "Name is required");
  }

  if (!email?.trim() || !emailPattern.test(email)) {
    throw createHttpError(400, "A valid email is required");
  }

  if (!password || password.length < 6) {
    throw createHttpError(400, "Password must be at least 6 characters long");
  }
};

const validateLoginInput = ({ email, password }) => {
  if (!email?.trim() || !emailPattern.test(email)) {
    throw createHttpError(400, "A valid email is required");
  }

  if (!password) {
    throw createHttpError(400, "Password is required");
  }
};

const registerUser = async ({ name, email, password }) => {
  validateRegisterInput({ name, email, password });

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw createHttpError(409, "An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  return {
    token: generateToken(user._id.toString()),
    user: sanitizeUser(user),
  };
};

const loginUser = async ({ email, password }) => {
  validateLoginInput({ email, password });

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");

  if (!user) {
    throw createHttpError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw createHttpError(401, "Invalid email or password");
  }

  return {
    token: generateToken(user._id.toString()),
    user: sanitizeUser(user),
  };
};

export { loginUser, registerUser, sanitizeUser };
