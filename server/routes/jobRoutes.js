const express = require("express");
const Job = require("../models/Job");
const Application = require("../models/Application");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/jobs/stats (Platform & dashboard metrics)
router.get("/stats", async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ status: "Open" });
    const totalApplications = await Application.countDocuments();
    const categories = await Job.distinct("category");

    let userStats = null;
    if (req.session && req.session.userId) {
      const myPostedCount = await Job.countDocuments({ poster: req.session.userId });
      const myApplicationsCount = await Application.countDocuments({ applicant: req.session.userId });
      const myAcceptedCount = await Application.countDocuments({
        applicant: req.session.userId,
        status: "Accepted"
      });
      userStats = {
        postedJobs: myPostedCount,
        applicationsSubmitted: myApplicationsCount,
        acceptedApplications: myAcceptedCount
      };
    }

    res.json({
      totalJobs,
      totalApplications,
      categoryCount: categories.length,
      userStats
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ message: "Failed to load platform stats" });
  }
});

// GET /api/jobs/my-jobs (Jobs posted by current user)
router.get("/my-jobs", requireAuth, async (req, res) => {
  try {
    const jobs = await Job.find({ poster: req.user._id }).sort({ createdAt: -1 });

    // Enhance jobs with live applicant counts from Application model
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const count = await Application.countDocuments({ job: job._id });
        const jobObj = job.toObject();
        jobObj.applicantCount = count;
        return jobObj;
      })
    );

    res.json({ jobs: jobsWithCounts });
  } catch (error) {
    console.error("My jobs error:", error);
    res.status(500).json({ message: "Failed to fetch your posted gigs" });
  }
});

// GET /api/jobs (Search, filter, paginate)
router.get("/", async (req, res) => {
  try {
    const {
      search,
      category,
      jobType,
      locationType,
      minBudget,
      maxBudget,
      sortBy = "newest",
      page = 1,
      limit = 12
    } = req.query;

    const query = {};

    // By default, show open jobs unless otherwise requested
    query.status = "Open";

    if (search && search.trim()) {
      const term = search.trim();
      query.$or = [
        { title: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { skills: { $regex: term, $options: "i" } },
        { location: { $regex: term, $options: "i" } }
      ];
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (jobType && jobType !== "All") {
      query.jobType = jobType;
    }

    if (locationType && locationType !== "All") {
      query.locationType = locationType;
    }

    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === "budget-high") sortOptions = { budget: -1 };
    if (sortBy === "budget-low") sortOptions = { budget: 1 };
    if (sortBy === "deadline") sortOptions = { deadline: 1 };
    if (sortBy === "oldest") sortOptions = { createdAt: 1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [total, jobs] = await Promise.all([
      Job.countDocuments(query),
      Job.find(query)
        .populate("poster", "name email college")
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
    ]);

    res.json({
      jobs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
});

// GET /api/jobs/:id (Single job details)
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("poster", "name email college bio");
    if (!job) {
      return res.status(404).json({ message: "Job listing not found" });
    }

    let hasApplied = false;
    let userApplication = null;
    if (req.session && req.session.userId) {
      userApplication = await Application.findOne({
        job: job._id,
        applicant: req.session.userId
      });
      hasApplied = !!userApplication;
    }

    res.json({
      job,
      hasApplied,
      userApplication
    });
  } catch (error) {
    console.error("Get job by id error:", error);
    res.status(500).json({ message: "Failed to fetch job details" });
  }
});

// POST /api/jobs (Create new job)
router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      jobType,
      locationType,
      location,
      budget,
      skills,
      deadline
    } = req.body;

    if (!title || !description || !category || !jobType || !budget || !deadline) {
      return res.status(400).json({
        message: "Please fill in all required fields (title, description, category, job type, budget, deadline)"
      });
    }

    const parsedBudget = Number(budget);
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      return res.status(400).json({ message: "Please enter a valid positive budget" });
    }

    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({ message: "Please provide a valid deadline date" });
    }

    const cleanSkills = Array.isArray(skills)
      ? skills.map((s) => String(s).trim()).filter(Boolean)
      : typeof skills === "string"
      ? skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const newJob = await Job.create({
      title: title.trim(),
      description: description.trim(),
      category,
      jobType,
      locationType: locationType || "Remote",
      location: location ? location.trim() : "Campus / Remote",
      budget: parsedBudget,
      skills: cleanSkills,
      deadline: parsedDeadline,
      poster: req.user._id
    });

    const populatedJob = await Job.findById(newJob._id).populate("poster", "name email college");

    res.status(201).json({
      message: "Job posted successfully!",
      job: populatedJob
    });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({
      message: error.message || "Failed to create job posting"
    });
  }
});

// PUT /api/jobs/:id (Edit ONLY one's own job)
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job listing not found" });
    }

    // Authorization check
    if (job.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized: You can only edit jobs that you posted"
      });
    }

    const {
      title,
      description,
      category,
      jobType,
      locationType,
      location,
      budget,
      skills,
      deadline,
      status
    } = req.body;

    if (title) job.title = title.trim();
    if (description) job.description = description.trim();
    if (category) job.category = category;
    if (jobType) job.jobType = jobType;
    if (locationType) job.locationType = locationType;
    if (location !== undefined) job.location = location.trim();
    if (budget !== undefined) {
      const b = Number(budget);
      if (!isNaN(b) && b >= 0) job.budget = b;
    }
    if (skills !== undefined) {
      job.skills = Array.isArray(skills)
        ? skills.map((s) => String(s).trim()).filter(Boolean)
        : typeof skills === "string"
        ? skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    }
    if (deadline) {
      const d = new Date(deadline);
      if (!isNaN(d.getTime())) job.deadline = d;
    }
    if (status && ["Open", "In Progress", "Completed", "Closed"].includes(status)) {
      job.status = status;
    }

    await job.save();

    res.json({
      message: "Job updated successfully",
      job
    });
  } catch (error) {
    console.error("Edit job error:", error);
    res.status(500).json({ message: "Failed to update job" });
  }
});

// DELETE /api/jobs/:id (Delete ONLY one's own job)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job listing not found" });
    }

    // Authorization check
    if (job.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized: You can only delete jobs that you posted"
      });
    }

    // Cascade delete associated applications
    await Application.deleteMany({ job: job._id });
    await Job.findByIdAndDelete(job._id);

    res.json({ message: "Job listing and associated applications deleted successfully" });
  } catch (error) {
    console.error("Delete job error:", error);
    res.status(500).json({ message: "Failed to delete job" });
  }
});

module.exports = router;
