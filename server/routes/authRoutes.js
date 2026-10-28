const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/auth/register (or /api/signup)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, college, bio, skills, role } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim()
    ) {
      return res.status(400).json({
        message: "Name, email, and password are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long"
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: "Please enter a valid email address"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists"
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      college: typeof college === "string" && college.trim() ? college.trim() : "Campus Student",
      bio: typeof bio === "string" ? bio.trim() : "",
      skills: Array.isArray(skills) ? skills.map((s) => String(s).trim()).filter(Boolean) : [],
      role: role === "recruiter" ? "recruiter" : "student"
    });

    // Auto-login session upon registration
    req.session.userId = newUser._id;

    res.status(201).json({
      message: "Signup successful! Welcome to CampusGig.",
      user: newUser.toSafeObject()
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: error.message || "Something went wrong during signup"
    });
  }
});

// POST /api/auth/login (or /api/login)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Set server session
    req.session.userId = user._id;

    res.json({
      message: "Login successful!",
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Something went wrong during login"
    });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ message: "Could not log out at this time" });
      }
      res.clearCookie("connect.sid");
      return res.json({ message: "Logged out successfully" });
    });
  } else {
    res.json({ message: "Already logged out" });
  }
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "No active session found" });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ message: "User not found" });
    }

    res.json({
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error("Me route error:", error);
    res.status(500).json({ message: "Failed to verify session" });
  }
});

// PUT /api/auth/profile
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { name, college, bio, skills, phone, github } = req.body;
    const user = req.user;

    if (name && typeof name === "string") user.name = name.trim();
    if (college !== undefined) user.college = String(college).trim();
    if (bio !== undefined) user.bio = String(bio).trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (github !== undefined) user.github = String(github).trim();
    if (Array.isArray(skills)) {
      user.skills = skills.map((s) => String(s).trim()).filter(Boolean);
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

module.exports = router;
