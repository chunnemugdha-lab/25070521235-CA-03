import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/apiClient";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertBanner from "../components/AlertBanner";
import Modal from "../components/Modal";

export default function MyPostedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Applicants Modal state
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [updatingAppId, setUpdatingAppId] = useState(null);

  // Delete Job state
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMyJobs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.getMyJobs();
      setJobs(res.jobs || []);
    } catch (err) {
      setError(err.message || "Failed to load your posted gigs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyJobs();
  }, []);

  const handleOpenApplicants = async (job) => {
    setSelectedJob(job);
    setLoadingApplicants(true);
    try {
      const res = await api.getJobApplicants(job._id);
      setApplicants(res.applicants || []);
    } catch (err) {
      setError(err.message || "Failed to load applicants for this gig");
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateApplicantStatus = async (applicationId, newStatus) => {
    setUpdatingAppId(applicationId);
    try {
      await api.updateApplicationStatus(applicationId, newStatus);
      // Update local state
      setApplicants((prev) =>
        prev.map((app) => (app._id === applicationId ? { ...app, status: newStatus } : app))
      );
      setSuccess(`Applicant marked as '${newStatus}'`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setUpdatingAppId(null);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    setDeleting(true);
    try {
      await api.deleteJob(jobToDelete._id);
      setJobs((prev) => prev.filter((j) => j._id !== jobToDelete._id));
      setJobToDelete(null);
      setSuccess("Gig listing and associated applicant data deleted.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete gig");
    } finally {
      setDeleting(false);
    }
  };

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

  if (loading) return <LoadingSpinner message="Retrieving your posted gigs..." />;

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "28px", color: "#fff", fontWeight: "700", marginBottom: "6px" }}>
            My Posted Gigs 📢
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Manage the gigs you created, view candidate cover letters, and select students for your tasks.
          </p>
        </div>

        <Link to="/post-job" className="btn btn-primary btn-sm">
          + Post a New Gig
        </Link>
      </div>

      <AlertBanner type="error" message={error} onClose={() => setError("")} />
      <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />

      {jobs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "50px 20px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🚀</div>
          <h3 style={{ color: "#fff", marginBottom: "8px" }}>No gigs posted yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
            Have a project, assignment, or campus task? Post it here to recruit talented fellow students.
          </p>
          <Link to="/post-job" className="btn btn-primary">
            + Post Your First Gig
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Gig Title</th>
                <th>Category</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Applicants</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id}>
                  <td>
                    <div style={{ fontWeight: "600", color: "#fff" }}>
                      <Link to={`/jobs/${job._id}`} style={{ color: "#fff" }}>
                        {job.title}
                      </Link>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                      {job.locationType} • {job.jobType}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-purple" style={{ fontSize: "11px" }}>
                      {job.category}
                    </span>
                  </td>
                  <td style={{ fontWeight: "600", color: "#fff" }}>
                    ₹{job.budget?.toLocaleString("en-IN")}
                  </td>
                  <td>
                    <span className={`badge ${job.status === "Open" ? "badge-green" : "badge-amber"}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: "12px", padding: "5px 12px" }}
                      onClick={() => handleOpenApplicants(job)}
                    >
                      👥 View Applicants ({job.applicantCount || 0})
                    </button>
                  </td>
                  <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {new Date(job.deadline).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <Link
                        to={`/edit-job/${job._id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "4px 8px", fontSize: "12px" }}
                        title="Edit gig"
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={() => setJobToDelete(job)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: "4px 8px", fontSize: "12px" }}
                        title="Delete gig"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Applicants Modal */}
      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob ? `Applicants for "${selectedJob.title}"` : "Applicants"}
      >
        {loadingApplicants ? (
          <LoadingSpinner message="Loading applicant profiles..." />
        ) : applicants.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "15px", marginBottom: "8px" }}>No applications received yet for this gig.</p>
            <p style={{ fontSize: "12px", color: "var(--text-dim)" }}>Check back soon as students discover your posting!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {applicants.map((app) => (
              <div
                key={app._id}
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <h4 style={{ color: "#fff", fontSize: "16px", marginBottom: "2px" }}>
                      {app.applicant?.name || "Student Applicant"}
                    </h4>
                    <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                      {app.applicant?.college || "Campus Member"} • {app.applicant?.email}
                    </div>
                    {app.applicant?.phone && (
                      <div style={{ color: "var(--text-dim)", fontSize: "11px" }}>
                        📞 {app.applicant.phone}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Proposed Rate</div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#fff" }}>
                      ₹{app.proposedRate}
                    </div>
                    <span className={`badge ${getStatusBadge(app.status)}`} style={{ marginTop: "4px" }}>
                      {app.status}
                    </span>
                  </div>
                </div>

                {/* Cover letter */}
                <div style={{ background: "var(--bg-main)", padding: "12px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)", marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "4px" }}>
                    Cover Letter Pitch:
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-main)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {app.coverLetter}
                  </div>
                </div>

                {/* Skills tags */}
                {app.applicant?.skills && app.applicant.skills.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                    {app.applicant.skills.map((skill, i) => (
                      <span key={i} className="badge" style={{ fontSize: "11px", background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Status Update Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                    Update Applicant Status:
                  </span>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                      disabled={updatingAppId === app._id || app.status === "Under Review"}
                      onClick={() => handleUpdateApplicantStatus(app._id, "Under Review")}
                    >
                      Under Review
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ fontSize: "11px", padding: "4px 8px", background: "var(--success)", color: "#fff" }}
                      disabled={updatingAppId === app._id || app.status === "Accepted"}
                      onClick={() => handleUpdateApplicantStatus(app._id, "Accepted")}
                    >
                      Accept Offer ✅
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                      disabled={updatingAppId === app._id || app.status === "Rejected"}
                      onClick={() => handleUpdateApplicantStatus(app._id, "Rejected")}
                    >
                      Reject ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        title="Confirm Gig Deletion"
      >
        {jobToDelete && (
          <div>
            <p style={{ color: "var(--text-main)", marginBottom: "14px" }}>
              Are you sure you want to delete <strong>"{jobToDelete.title}"</strong>?
            </p>
            <p style={{ color: "var(--danger)", fontSize: "13px", marginBottom: "20px" }}>
              ⚠️ This will permanently delete the gig and remove all associated candidate applications.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setJobToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteJob}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete Gig"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
