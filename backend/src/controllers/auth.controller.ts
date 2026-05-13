import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "hrcompetition_secret_key";

// Register (for applicants only)
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res
        .status(400)
        .json({ success: false, message: "Please fill all required fields!" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "An account with this email already exists!",
      });
      return;
    }

    // Always register as applicant
    const user = new User({ name, email, password, phone, role: "applicant" });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Registration failed", error });
  }
};

// Login (for both applicants and HR)
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res
        .status(400)
        .json({ success: false, message: "Please fill all fields!" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password!" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password!" });
      return;
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed", error });
  }
};

// Get current user
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findById((req as any).userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to get user", error });
  }
};

// Accept invite and set password
export const acceptInvite = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json({ success: false, message: "Token and password are required" });
      return;
    }

    // Verify the token
    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    } catch {
      res.status(400).json({ success: false, message: "Invalid or expired invite link" });
      return;
    }

    const { email, name, role } = payload;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ success: false, message: "Account already activated. Please login." });
      return;
    }

    // Hash password and create user
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      isActive: true,
    });

    await user.save();

    res.status(201).json({ success: true, message: "Account activated successfully! You can now login." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to activate account", error: error.message });
  }
};
