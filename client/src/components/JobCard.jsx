import React from "react";
import { Link } from "react-router-dom";

export default function JobCard({ job }) {
  const formatDeadline = (dateString) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Due today!";
    if (diffDays === 1) return "Due tomorrow";
    return `${diffDays} days left`;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Web Development":
        return "badge-purple";
      case "Design & Creative":
        return "badge-blue";
      case "Tutoring & Academics":
        return "badge-green";
      case "Writing & Content":
        return "badge-amber";
      default:
        return "badge-purple";
    }
  };

  return (
    <div className="card card-hover" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
        <span className={`badge ${getCategoryColor(job.category)}`}>
          {job.category}
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          <span className="badge badge-purple" style={{ fontSize: "11px" }}>
            {job.jobType}
          </span>
          <span className="badge" style={{ fontSize: "11px", background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
            {job.locationType}
          </span>
        </div>
      </div>

      <h3 style={{ fontSize: "18px", color: "#fff", marginBottom: "8px", fontWeight: "600", lineHeight: 1.3 }}>
        <Link to={`/jobs/${job._id}`} style={{ color: "inherit" }}>
          {job.title}
        </Link>
      </h3>

      <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: 1.5, marginBottom: "16px", flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {job.description}
      </p>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
          {job.skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              style={{
                fontSize: "11px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "4px",
                padding: "2px 8px",
                color: "var(--text-muted)"
              }}
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span style={{ fontSize: "11px", color: "var(--text-dim)", alignSelf: "center" }}>
              +{job.skills.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", marginTop: "auto" }}>
        <div>
          <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>Budget</div>
          <div style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>
            ₹{job.budget?.toLocaleString("en-IN")}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
            ⏳ {formatDeadline(job.deadline)}
          </div>
          <Link
            to={`/jobs/${job._id}`}
            className="btn btn-outline btn-sm"
            style={{ marginTop: "4px" }}
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
