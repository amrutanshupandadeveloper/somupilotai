import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const requiredVars = ["ADMIN_NAME", "ADMIN_EMAIL", "ADMIN_PASSWORD"];

const validateEnv = () => {
  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required env variables: ${missing.join(", ")}`);
  }
};

const createAdmin = async () => {
  validateEnv();
  await connectDB();

  const name = process.env.ADMIN_NAME.trim();
  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const currentAdminEmail = (process.env.CURRENT_ADMIN_EMAIL || email).trim().toLowerCase();
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  const existingUser = await User.findOne({
    email: { $in: [currentAdminEmail, email] },
  }).select("+passwordHash");

  if (existingUser) {
    const conflictingUser =
      currentAdminEmail !== email
        ? await User.findOne({
            email,
            _id: { $ne: existingUser._id },
          })
        : null;

    if (conflictingUser) {
      throw new Error(
        `Cannot change admin email to ${email} because another user already uses it`
      );
    }

    existingUser.name = name;
    existingUser.email = email;
    existingUser.passwordHash = passwordHash;
    existingUser.role = "admin";
    existingUser.status = "active";
    await existingUser.save();
    console.log(
      `Updated admin user: ${currentAdminEmail} -> ${email}`
    );
    return;
  }

  await User.create({
    name,
    email,
    passwordHash,
    role: "admin",
    status: "active",
  });

  console.log(`Created admin user: ${email}`);
};

createAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  });
