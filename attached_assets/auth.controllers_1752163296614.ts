import User from "../models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt";
import { Request, Response } from "express";

export const register = async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;

  console.log("📩 Incoming registration request");
  console.log("📦 Body:", req.body);

  // Validation
  if (!fullName || !email || !password) {
    console.log("❌ Missing required fields.");
    return res.status(400).json({ message: "All fields are required." });
  }

  if (password.length < 6) {
    console.log("❌ Password too short.");
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) {
      console.log("❌ User already exists:", email);
      return res.status(400).json({ message: "User already exists." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ fullName, email, password: hashed });

    console.log("✅ User created:", user.email);
    return res.status(201).json({ message: "User registered successfully." });

  } catch (err) {
    console.error("💥 Registration error:", err);
    return res.status(500).json({ message: "Registration failed", error: err });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  console.log("🔐 Login attempt:", email);

  if (!email || !password) {
    console.log("❌ Missing email or password");
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ No user found for:", email);
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password mismatch for:", email);
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = generateToken(user._id.toString());
    console.log("✅ Login successful for:", email);

    return res.status(200).json({
      token,
      user: {
        fullName: user.fullName,
        email: user.email
      }
    });

  } catch (err) {
    console.error("💥 Login error:", err);
    return res.status(500).json({ message: "Login failed", error: err });
  }
};
