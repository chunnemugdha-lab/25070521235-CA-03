const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job reference is required"],
      index: true
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Applicant reference is required"],
      index: true
    },
    coverLetter: {
      type: String,
      required: [true, "Cover letter is required"],
      trim: true,
      minlength: [10, "Cover letter must be at least 10 characters"]
    },
    proposedRate: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ["Pending", "Under Review", "Accepted", "Rejected"],
      default: "Pending"
    }
  },
  {
    timestamps: true
  }
);

// Compound index to guarantee one application per student per job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
