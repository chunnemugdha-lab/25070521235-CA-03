import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api/apiClient";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertBanner from "../components/AlertBanner";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [userApplication, setUserApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Application Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyMessage, setApplyMessage] = useState({ type: "", text: "" });

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const loadJob = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.getJobById(id);
      setJob(res.job);
      setHasApplied(res.hasApplied);
      setUserApplication(res.userApplication);
      if (res.job) {
        setProposedRate(res.job.budget);
      }
    } catch (err) {
      setError(err.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
  }, [id, isAuthenticated]);

  const isOwner = user && job && (job.poster?._id === user._id || job.poster === user._id || job.poster?.id === user.id);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyMessage({ type: "", text: "" });

    if (!coverLetter.trim() || coverLetter.trim().length < 10) {
      setApplyMessage({ type: "error", text: "Please write a cover letter with at least 10 characters." });
      return;
    }

    setApplySubmitting(true);
    try {
      const res = await api.applyToJob({
        jobId: job._id,
        coverLetter: coverLetter.trim(),
        proposedRate: Number(proposedRate) || job.budget
      });

      setApplyMessage({ type: "success", text: res.message || "Application submitted successfully!" });
      setHasApplied(true);
      setUserApplication(res.application);
      setTimeout(() => {
        setIsApplyModalOpen(false);
        loadJob();
      }, 1500);
    } catch (err) {
      setApplyMessage({ type: "error", text: err.message || "Failed to submit application." });
    } finally {
      setApplySubmitting(false);
    }
  };

  const handleDeleteJob = async () => {
    setDeleteSubmitting(true);
    try {
      await api.deleteJob(job._id);
      setIsDeleteModalOpen(false);
      navigate("/my-jobs");
    } catch (err) {
      setError(err.message || "Failed to delete gig");
      setDeleteSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading gig details..." />;

  if (error || !job) {
    return (
      <div className="card" style={{ maxWidth: "600px", margin: "40px auto", textAlign: "center" }}>
        <h2 style={{ color: "#fff", marginBottom: "12px" }}>Gig Not Found</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>{error || "The gig you are looking for does not exist or was removed."}</p>
        <Link to="/jobs" className="btn btn-primary">← Back to All Gigs</Link>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "Accepted":
        return "badge-green";
      case "Under Review":
        return "badge-blue";
      case "Rejected":
        return "badge-red";
      default:
        return "badge-amber";
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <Link to="/jobs" style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          ← Back to All Gigs
        </Link>
      </div>

      <AlertBanner type="error" message={error} onClose={() => setError("")} />

      {/* Main Job Card */}
      <div className="card" style={{ padding: "32px", marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span className="badge badge-purple">{job.category}</span>
              <span className="badge badge-blue">{job.jobType}</span>
              <span className="badge" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                📍 {job.locationType} • {job.location}
              </span>
            </div>
            <h1 style={{ fontSize: "28px", color: "#fff", fontWeight: "700", lineHeight: 1.3 }}>
              {job.title}
            </h1>
          </div>

          <div style={{ textAlign: "right", minWidth: "160px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>Offered Pay</div>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#fff" }}>
              ₹{job.budget?.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "4px" }}>
              Status: <strong style={{ color: job.status === "Open" ? "var(--success)" : "var(--text-muted)" }}>{job.status}</strong>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div style={{ background: "var(--bg-input)", padding: "16px 20px", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", marginBottom: "28px" }}>
          <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            <span>Posted: <strong>{new Date(job.createdAt).toLocaleDateString()}</strong></span>
            <span style={{ margin: "0 10px" }}>•</span>
            <span>Deadline: <strong>{new Date(job.deadline).toLocaleDateString()}</strong></span>
            <span style={{ margin: "0 10px" }}>•</span>
            <span>Applicants: <strong>{job.applicantCount || 0}</strong></span>
          </div>

          <div>
            {isOwner ? (
              <div style={{ display: "flex", gap: "10px" }}>
                <Link to={`/edit-job/${job._id}`} className="btn btn-secondary btn-sm">
                  ✏️ Edit Post
                </Link>
                <button onClick={() => setIsDeleteModalOpen(true)} className="btn btn-danger btn-sm">
                  🗑️ Delete Post
                </button>
              </div>
            ) : hasApplied ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className={`badge ${getStatusBadge(userApplication?.status || "Pending")}`}>
                  Applied: {userApplication?.status || "Pending"}
                </span>
                <Link to="/my-applications" className="btn btn-secondary btn-sm">
                  View in My Applications →
                </Link>
              </div>
            ) : isAuthenticated ? (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="btn btn-primary btn-sm"
                disabled={job.status !== "Open"}
              >
                {job.status === "Open" ? "Apply for this Gig 🚀" : "Applications Closed"}
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                Log In to Apply
              </Link>
            )}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: "28px" }}>
          <h3 style={{ fontSize: "18px", color: "#fff", marginBottom: "12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
            Gig Description & Scope
          </h3>
          <p style={{ color: "var(--text-main)", fontSize: "15px", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
            {job.description}
          </p>
        </div>

        {/* Skills Required */}
        {job.skills && job.skills.length > 0 && (
          <div style={{ marginBottom: "28px" }}>
            <h3 style={{ fontSize: "18px", color: "#fff", marginBottom: "12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
              Desired Skills & Tools
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  style={{
                    background: "rgba(139, 92, 246, 0.12)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    color: "#c4b5fd",
                    padding: "6px 14px",
                    borderRadius: "var(--radius-md)",
                    fontSize: "13px",
                    fontWeight: "500"
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Poster Profile Info */}
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "24px" }}>
          <h3 style={{ fontSize: "16px", color: "#fff", marginBottom: "12px" }}>
            About the Poster
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="user-avatar-circle" style={{ width: "42px", height: "42px", fontSize: "18px" }}>
              {job.poster?.name?.charAt(0) || "P"}
            </div>
            <div>
              <div style={{ fontWeight: "600", color: "#fff", fontSize: "15px" }}>
                {job.poster?.name || "Student Poster"}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                {job.poster?.college || "Campus Member"}
              </div>
              {job.poster?.bio && (
                <div style={{ color: "var(--text-dim)", fontSize: "12px", marginTop: "4px" }}>
                  "{job.poster.bio}"
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={`Apply for "${job.title}"`}
      >
        <form onSubmit={handleApplySubmit}>
          <AlertBanner
            type={applyMessage.type}
            message={applyMessage.text}
            onClose={() => setApplyMessage({ type: "", text: "" })}
          />

          <div className="form-group">
            <label className="form-label">
              Cover Letter & Relevant Experience *
            </label>
            <textarea
              className="form-textarea"
              rows={5}
              placeholder="Explain why you are a great fit, any relevant coursework or portfolio links, and your timeline..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              required
              minLength={10}
            />
            <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
              Minimum 10 characters ({coverLetter.length}/10)
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">
              Proposed Rate / Fee (₹)
            </label>
            <input
              type="number"
              className="form-input"
              value={proposedRate}
              onChange={(e) => setProposedRate(e.target.value)}
              min={0}
              placeholder={String(job.budget)}
            />
            <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
              Posted budget: ₹{job.budget}. You can propose this or a custom rate.
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsApplyModalOpen(false)}
              disabled={applySubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={applySubmitting}
            >
              {applySubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Gig Posting"
      >
        <div>
          <p style={{ color: "var(--text-main)", marginBottom: "16px" }}>
            Are you sure you want to delete <strong>"{job.title}"</strong>?
          </p>
          <p style={{ color: "var(--danger)", fontSize: "13px", marginBottom: "24px" }}>
            ⚠️ This will also permanently remove all {job.applicantCount || 0} candidate applications received for this gig. This action cannot be undone.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteJob}
              disabled={deleteSubmitting}
            >
              {deleteSubmitting ? "Deleting..." : "Yes, Delete Gig"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
