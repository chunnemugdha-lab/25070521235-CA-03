import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/apiClient";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertBanner from "../components/AlertBanner";
import Modal from "../components/Modal";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCoverLetter, setSelectedCoverLetter] = useState(null);

  useEffect(() => {
    async function fetchMyApplications() {
      try {
        setLoading(true);
        const res = await api.getMyApplications();
        setApplications(res.applications || []);
      } catch (err) {
        setError(err.message || "Failed to load your applications");
      } finally {
        setLoading(false);
      }
    }
    fetchMyApplications();
  }, []);

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

  const filteredApps = applications.filter((app) => {
    if (statusFilter === "All") return true;
    return app.status === statusFilter;
  });

  if (loading) return <LoadingSpinner message="Retrieving your submitted applications..." />;

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "28px", color: "#fff", fontWeight: "700", marginBottom: "6px" }}>
            My Applications 📝
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Track the status of all student gigs you have applied for.
          </p>
        </div>

        <Link to="/jobs" className="btn btn-primary btn-sm">
          + Explore More Gigs
        </Link>
      </div>

      <AlertBanner type="error" message={error} onClose={() => setError("")} />

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {["All", "Pending", "Under Review", "Accepted", "Rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`btn btn-sm ${statusFilter === status ? "btn-primary" : "btn-secondary"}`}
          >
            {status} ({status === "All" ? applications.length : applications.filter((a) => a.status === status).length})
          </button>
        ))}
      </div>

      {filteredApps.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "50px 20px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📬</div>
          <h3 style={{ color: "#fff", marginBottom: "8px" }}>
            {statusFilter === "All" ? "No applications yet" : `No applications with status '${statusFilter}'`}
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
            {statusFilter === "All"
              ? "Browse through open student projects and submit your first application!"
              : "Try viewing all applications or apply for new open positions."}
          </p>
          <Link to="/jobs" className="btn btn-primary">
            Explore Gigs Now
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Gig Details</th>
                <th>Category</th>
                <th>Offered / Proposed</th>
                <th>Poster</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app._id}>
                  <td>
                    <div style={{ fontWeight: "600", color: "#fff" }}>
                      {app.job ? (
                        <Link to={`/jobs/${app.job._id}`} style={{ color: "#fff" }}>
                          {app.job.title}
                        </Link>
                      ) : (
                        <span style={{ color: "var(--text-dim)" }}>[Deleted Gig]</span>
                      )}
                    </div>
                    {app.job && (
                      <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>
                        {app.job.locationType} • {app.job.jobType}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="badge badge-purple" style={{ fontSize: "11px" }}>
                      {app.job?.category || "Other"}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: "600", color: "#fff" }}>₹{app.proposedRate}</div>
                    {app.job && app.job.budget !== app.proposedRate && (
                      <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                        (Listed: ₹{app.job.budget})
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: "13px", color: "var(--text-main)" }}>
                      {app.job?.poster?.name || "Campus Poster"}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                      {app.job?.poster?.college || "Campus"}
                    </div>
                  </td>
                  <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: "11px", padding: "4px 8px" }}
                      onClick={() =>
                        setSelectedCoverLetter({
                          jobTitle: app.job?.title || "Gig Application",
                          coverLetter: app.coverLetter,
                          proposedRate: app.proposedRate,
                          date: new Date(app.createdAt).toLocaleDateString()
                        })
                      }
                    >
                      View Pitch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cover Letter Modal */}
      <Modal
        isOpen={!!selectedCoverLetter}
        onClose={() => setSelectedCoverLetter(null)}
        title={`Your Application Pitch`}
      >
        {selectedCoverLetter && (
          <div>
            <div style={{ marginBottom: "16px", padding: "12px", background: "var(--bg-input)", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#fff" }}>
                {selectedCoverLetter.jobTitle}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "4px" }}>
                Proposed: ₹{selectedCoverLetter.proposedRate} • Submitted: {selectedCoverLetter.date}
              </div>
            </div>

            <h4 style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "8px" }}>
              Cover Letter & Proposal:
            </h4>
            <div style={{ color: "var(--text-main)", fontSize: "14px", lineHeight: 1.7, whiteSpace: "pre-wrap", background: "var(--bg-main)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              {selectedCoverLetter.coverLetter}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedCoverLetter(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
