const express = require("express");
const Application = require("../models/Application");
const Job = require("../models/Job");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// POST /api/applications (Apply to a job)
router.post("/", requireAuth, async (req, res) => {
  try {
    const { jobId, coverLetter, proposedRate } = req.body;

    if (!jobId || !coverLetter || !coverLetter.trim()) {
      return res.status(400).json({
        message: "Job ID and a cover letter are required to apply"
      });
    }

    if (coverLetter.trim().length < 10) {
      return res.status(400).json({
        message: "Please write a cover letter with at least 10 characters"
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "The job listing no longer exists" });
    }

    if (job.status !== "Open") {
      return res.status(400).json({
        message: `This job is currently ${job.status.toLowerCase()} and is not accepting applications.`
      });
    }

    // Prevent poster from applying to own job
    if (job.poster.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "Action not allowed: You cannot apply to a job that you posted yourself."
      });
    }

    // Check for duplicate application
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id
    });

    if (existingApplication) {
      return res.status(409).json({
        message: "You have already submitted an application for this gig"
      });
    }

    const newApplication = await Application.create({
      job: jobId,
      applicant: req.user._id,
      coverLetter: coverLetter.trim(),
      proposedRate: Number(proposedRate) || job.budget
    });

    // Update job applicant count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

    const populatedApp = await Application.findById(newApplication._id)
      .populate("job", "title category budget status")
      .populate("applicant", "name email college");

    res.status(201).json({
      message: "Application submitted successfully! Good luck!",
      application: populatedApp
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already applied for this gig"
      });
    }
    console.error("Apply error:", error);
    res.status(500).json({ message: "Failed to submit application" });
  }
});

// GET /api/applications/my-applications (Current student's applications)
router.get("/my-applications", requireAuth, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({
        path: "job",
        select: "title category budget jobType locationType location status deadline poster",
        populate: {
          path: "poster",
          select: "name email college"
        }
      })
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error("My applications error:", error);
    res.status(500).json({ message: "Failed to fetch your applications" });
  }
});

// GET /api/applications/job/:jobId (View applicants for a specific job - Poster only)
router.get("/job/:jobId", requireAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job listing not found" });
    }

    if (job.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized: Only the creator of this job can view applicant details"
      });
    }

    const applicants = await Application.find({ job: job._id })
      .populate("applicant", "name email college bio skills phone github createdAt")
      .sort({ createdAt: -1 });

    res.json({
      jobTitle: job.title,
      jobId: job._id,
      applicants
    });
  } catch (error) {
    console.error("Get applicants error:", error);
    res.status(500).json({ message: "Failed to fetch applicants for this gig" });
  }
});

// PATCH /api/applications/:id/status (Update applicant status - Poster only)
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Pending", "Under Review", "Accepted", "Rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}`
      });
    }

    const application = await Application.findById(req.params.id).populate("job");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Verify current user is the poster of the job
    if (application.job.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized: Only the creator of this job can update applicant status"
      });
    }

    application.status = status;
    await application.save();

    res.json({
      message: `Applicant status updated to '${status}'`,
      application
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ message: "Failed to update application status" });
  }
});

module.exports = router;
