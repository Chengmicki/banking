import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { generateToken } from "../utils/jwt";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "";

mongoose.connect(MONGO_URI).then(async () => {
  const email = "testuser@everstead.com";
  const exists = await User.findOne({ email });

  if (exists) {
    console.log("🚫 Test user already exists.");
    console.log("Use this token:\n", generateToken(exists._id.toString()));
    process.exit();
  }

  const hashed = await bcrypt.hash("12345678", 10);
  const user = await User.create({
    fullName: "Test User",
    email,
    password: hashed,
  });

  console.log("✅ Test user created!");
  console.log("Email:", email);
  console.log("Password: 12345678");
  console.log("Token:", generateToken(user._id.toString()));
  process.exit();
});
