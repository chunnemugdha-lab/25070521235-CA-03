import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/apiClient";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertBanner from "../components/AlertBanner";

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [statsRes, appsRes, jobsRes] = await Promise.all([
          api.getStats(),
          api.getMyApplications(),
          api.getMyJobs()
        ]);

        setStats(statsRes.userStats || {
          postedJobs: 0,
          applicationsSubmitted: 0,
          acceptedApplications: 0
        });
        setRecentApplications(appsRes.applications?.slice(0, 5) || []);
        setMyJobs(jobsRes.jobs?.slice(0, 4) || []);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
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

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

  return (
    <div className="animate-fade-in">
      {/* Welcome Banner */}
      <div className="card" style={{ padding: "28px", background: "linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(236, 72, 153, 0.08))", borderColor: "rgba(139, 92, 246, 0.25)", marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span className="badge badge-purple" style={{ marginBottom: "8px" }}>
              Student Hub
            </span>
            <h1 style={{ fontSize: "28px", color: "#fff", fontWeight: "700", marginBottom: "6px" }}>
              Welcome back, {user?.name}! 👋
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              {user?.college || "Campus Member"} • {user?.email}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link to="/post-job" className="btn btn-primary btn-sm">
              + Post a Gig
            </Link>
            <Link to="/jobs" className="btn btn-secondary btn-sm">
              Find Gigs →
            </Link>
          </div>
        </div>
      </div>

      <AlertBanner type="error" message={error} onClose={() => setError("")} />

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: "32px" }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(139, 92, 246, 0.15)", color: "var(--primary)" }}>
            📨
          </div>
          <div>
            <div className="stat-value">{stats?.applicationsSubmitted || 0}</div>
            <div className="stat-label">Applications Submitted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--success)" }}>
            🎉
          </div>
          <div>
            <div className="stat-value">{stats?.acceptedApplications || 0}</div>
            <div className="stat-label">Accepted Gigs</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.15)", color: "var(--info)" }}>
            📢
          </div>
          <div>
            <div className="stat-value">{stats?.postedJobs || 0}</div>
            <div className="stat-label">Gigs You Posted</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(236, 72, 153, 0.15)", color: "var(--secondary)" }}>
            ⭐
          </div>
          <div>
            <div className="stat-value">{user?.skills?.length || 0}</div>
            <div className="stat-label">Profile Skills Listed</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Applications & My Posted Gigs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        {/* Recent Applications */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h3 style={{ fontSize: "18px", color: "#fff", margin: 0 }}>Recent Applications</h3>
            <Link to="/my-applications" style={{ color: "var(--primary)", fontSize: "13px" }}>
              View all ({stats?.applicationsSubmitted || 0}) →
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-muted)", fontSize: "14px" }}>
              <p style={{ marginBottom: "12px" }}>You haven't applied to any gigs yet.</p>
              <Link to="/jobs" className="btn btn-outline btn-sm">Explore Opportunities</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentApplications.map((app) => (
                <div
                  key={app._id}
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: "10px" }}>
                    <div style={{ fontWeight: "600", color: "#fff", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <Link to={`/jobs/${app.job?._id}`} style={{ color: "inherit" }}>
                        {app.job?.title || "Deleted Job Listing"}
                      </Link>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                      Rate: ₹{app.proposedRate} • {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className={`badge ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Posted Gigs */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h3 style={{ fontSize: "18px", color: "#fff", margin: 0 }}>My Posted Gigs</h3>
            <Link to="/my-jobs" style={{ color: "var(--primary)", fontSize: "13px" }}>
              Manage all ({myJobs.length}) →
            </Link>
          </div>

          {myJobs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-muted)", fontSize: "14px" }}>
              <p style={{ marginBottom: "12px" }}>You haven't posted any gigs yet.</p>
              <Link to="/post-job" className="btn btn-primary btn-sm">+ Post a Student Gig</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {myJobs.map((job) => (
                <div
                  key={job._id}
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: "10px" }}>
                    <div style={{ fontWeight: "600", color: "#fff", fontSize: "14px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <Link to={`/jobs/${job._id}`} style={{ color: "inherit" }}>
                        {job.title}
                      </Link>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                      ₹{job.budget} • Status: {job.status}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="badge badge-purple" style={{ fontSize: "11px" }}>
                      {job.applicantCount || 0} applicants
                    </span>
                    <Link to="/my-jobs" className="btn btn-secondary btn-sm" style={{ padding: "4px 8px", fontSize: "11px" }}>
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
