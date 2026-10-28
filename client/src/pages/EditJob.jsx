import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertBanner from "../components/AlertBanner";

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [jobType, setJobType] = useState("Freelance");
  const [locationType, setLocationType] = useState("Remote");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [skills, setSkills] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("Open");

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    async function fetchJob() {
      try {
        setInitialLoading(true);
        const res = await api.getJobById(id);
        const job = res.job;

        if (!job) {
          setError("Job listing not found.");
          return;
        }

        // Authorization check
        const posterId = job.poster?._id || job.poster;
        if (user && posterId !== user._id && posterId !== user.id) {
          setError("Unauthorized: You can only edit gigs that you posted.");
          return;
        }

        setTitle(job.title || "");
        setDescription(job.description || "");
        setCategory(job.category || "Web Development");
        setJobType(job.jobType || "Freelance");
        setLocationType(job.locationType || "Remote");
        setLocation(job.location || "");
        setBudget(job.budget || "");
        setSkills(job.skills ? job.skills.join(", ") : "");
        setStatus(job.status || "Open");

        if (job.deadline) {
          setDeadline(new Date(job.deadline).toISOString().split("T")[0]);
        }
      } catch (err) {
        setError(err.message || "Failed to load job details.");
      } finally {
        setInitialLoading(false);
      }
    }
    fetchJob();
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim() || !budget || !deadline) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await api.updateJob(id, {
        title: title.trim(),
        description: description.trim(),
        category,
        jobType,
        locationType,
        location: location.trim(),
        budget: Number(budget),
        skills: skillsArray,
        deadline,
        status
      });

      navigate(`/jobs/${id}`);
    } catch (err) {
      setError(err.message || "Failed to update gig.");
      setSaving(false);
    }
  };

  if (initialLoading) return <LoadingSpinner message="Loading gig information..." />;

  return (
    <div className="animate-fade-in" style={{ maxWidth: "720px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "28px", color: "#fff", fontWeight: "700", marginBottom: "8px" }}>
          Edit Campus Gig ✏️
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Update the scope, timeline, budget, or status of your posted gig.
        </p>
      </div>

      <div className="card" style={{ padding: "32px" }}>
        <AlertBanner type="error" message={error} onClose={() => setError("")} />

        <form onSubmit={handleSubmit}>
          {/* Status Bar */}
          <div className="form-group" style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "var(--radius-md)" }}>
            <label className="form-label" style={{ color: "#fff" }}>Gig Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Open">Open (Accepting Applications)</option>
              <option value="In Progress">In Progress (Gig Awarded)</option>
              <option value="Completed">Completed (Project Finished)</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Gig Title *</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Category & Job Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Gig Type</label>
              <select
                className="form-select"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                <option value="Freelance">Freelance Project</option>
                <option value="Part-time">Part-time Role</option>
                <option value="One-time Task">One-time Task</option>
                <option value="Internship">Micro-Internship</option>
              </select>
            </div>
          </div>

          {/* Location Type & Details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Workplace Setup</label>
              <select
                className="form-select"
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
              >
                <option value="Remote">100% Remote</option>
                <option value="On-Campus">On-Campus</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Location Details</label>
              <input
                type="text"
                className="form-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Budget & Deadline */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Budget (₹) *</label>
              <input
                type="number"
                className="form-input"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Application Deadline *</label>
              <input
                type="date"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Required Skills */}
          <div className="form-group">
            <label className="form-label">Skills (comma separated)</label>
            <input
              type="text"
              className="form-input"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description & Details *</label>
            <textarea
              className="form-textarea"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/jobs/${id}`)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
