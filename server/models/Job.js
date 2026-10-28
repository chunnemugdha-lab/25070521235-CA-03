const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"]
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Web Development",
        "Design & Creative",
        "Writing & Content",
        "Tutoring & Academics",
        "Video & Audio",
        "Marketing & Social Media",
        "Campus Services",
        "Other"
      ],
      default: "Other"
    },
    jobType: {
      type: String,
      required: [true, "Job type is required"],
      enum: ["Freelance", "Part-time", "One-time Task", "Internship"],
      default: "Freelance"
    },
    locationType: {
      type: String,
      required: [true, "Location type is required"],
      enum: ["Remote", "On-Campus", "Hybrid"],
      default: "Remote"
    },
    location: {
      type: String,
      default: "Remote / Campus",
      trim: true
    },
    budget: {
      type: Number,
      required: [true, "Budget is required"],
      min: [0, "Budget cannot be negative"]
    },
    skills: {
      type: [String],
      default: []
    },
    deadline: {
      type: Date,
      required: [true, "Application deadline is required"]
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Completed", "Closed"],
      default: "Open"
    },
    poster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Job poster is required"],
      index: true
    },
    applicantCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Search indexes
jobSchema.index({ title: "text", description: "text" });
jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Job", jobSchema);
