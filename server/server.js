require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");

const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/freelance_gig_db";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const SESSION_SECRET =
  process.env.SESSION_SECRET || "campusgig_college_secret_key_session_2026_dev";

// Middleware configuration
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session with MongoStore for persistent sessions
app.use(
  session({
    name: "campusgig.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
      httpOnly: true,
      secure: false, // false for localhost HTTP development
      sameSite: "lax", // optimal for localhost client & server on separate ports
      maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
    }
  })
);

// Base health check endpoint
app.get("/", (req, res) => {
  res.json({
    name: "CampusGig API",
    status: "online",
    version: "1.0.0",
    docs: "/api",
    database: "connected"
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "CampusGig Student Freelance Marketplace API",
    endpoints: {
      auth: "/api/auth (/register, /login, /logout, /me, /profile)",
      jobs: "/api/jobs (GET, POST, PUT, DELETE, /stats, /my-jobs)",
      applications: "/api/applications (POST, /my-applications, /job/:jobId, /:id/status)"
    }
  });
});

// Modular Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

// Backward compatibility redirects for existing client code
app.post("/api/signup", (req, res, next) => {
  req.url = "/register";
  authRoutes(req, res, next);
});

app.post("/api/login", (req, res, next) => {
  req.url = "/login";
  authRoutes(req, res, next);
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack || err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "production" ? undefined : err.toString()
  });
});

// Connect to MongoDB and start listening
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("=========================================");
    console.log("MongoDB Connected Successfully!");
    console.log(`Database: freelance_gig_db at 127.0.0.1:27017`);
    console.log("=========================================");

    app.listen(PORT, () => {
      console.log(`CampusGig Server running on http://localhost:${PORT}`);
      console.log(`Client Origin: ${CLIENT_URL}`);
      console.log("Ready to handle student requests!");
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  });
