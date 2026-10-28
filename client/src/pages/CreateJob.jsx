import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/apiClient";
import AlertBanner from "../components/AlertBanner";

export default function CreateJob() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [jobType, setJobType] = useState("Freelance");
  const [locationType, setLocationType] = useState("Remote");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [skills, setSkills] = useState("");
  const [deadline, setDeadline] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    "Web Development",
    "Design & Creative",
    "Writing & Content",
    "Tutoring & Academics",
    "Video & Audio",
    "Marketing & Social Media",
    "Campus Services",
    "Other"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim() || !budget || !deadline) {
      setError("Please fill in all required fields (title, description, budget, and deadline).");
      return;
    }

    if (Number(budget) < 0) {
      setError("Budget must be a positive number.");
      return;
    }

    setLoading(true);
    try {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await api.createJob({
        title: title.trim(),
        description: description.trim(),
        category,
        jobType,
        locationType,
        location: location.trim() || (locationType === "Remote" ? "Remote" : "Campus"),
        budget: Number(budget),
        skills: skillsArray,
        deadline
      });

      if (res && res.job) {
        navigate(`/jobs/${res.job._id}`);
      } else {
        navigate("/my-jobs");
      }
    } catch (err) {
      setError(err.message || "Failed to post gig");
      setLoading(false);
    }
  };

  // Set min deadline to tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div className="animate-fade-in" style={{ maxWidth: "720px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "28px", color: "#fff", fontWeight: "700", marginBottom: "8px" }}>
          Post a Campus Gig 📢
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
          Need assistance with a club project, coding assignment, design task, or tutoring? Connect with talented peers.
        </p>
      </div>

      <div className="card" style={{ padding: "32px" }}>
        <AlertBanner type="error" message={error} onClose={() => setError("")} />

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Gig Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Build Landing Page in React for Robotics Club"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={150}
            />
          </div>

          {/* Category & Job Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Gig Type *</label>
              <select
                className="form-select"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                required
              >
                <option value="Freelance">Freelance Project</option>
                <option value="Part-time">Part-time Role</option>
                <option value="One-time Task">One-time Task</option>
                <option value="Internship">Micro-Internship</option>
              </select>
            </div>
          </div>

          {/* Location Type & Location Details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Workplace Setup *</label>
              <select
                className="form-select"
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                required
              >
                <option value="Remote">100% Remote</option>
                <option value="On-Campus">On-Campus</option>
                <option value="Hybrid">Hybrid (Remote + Campus)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Location / Room Details</label>
              <input
                type="text"
                className="form-input"
                placeholder={locationType === "Remote" ? "Online / Discord" : "e.g., Computer Lab 2, Library"}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Budget & Deadline */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Budget / Compensation (₹) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g., 5000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                min="0"
                step="50"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Application Deadline *</label>
              <input
                type="date"
                className="form-input"
                min={minDateStr}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Required Skills */}
          <div className="form-group">
            <label className="form-label">Skills & Tech Stack (comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., React, JavaScript, Tailwind, Figma"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
              Separate skills with commas to help students match their abilities
            </span>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Detailed Description & Deliverables *</label>
            <textarea
              className="form-textarea"
              rows={6}
              placeholder="Describe the objective, responsibilities, expected timeline, and any milestones..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Publishing Gig..." : "Publish Gig Post 🚀"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
