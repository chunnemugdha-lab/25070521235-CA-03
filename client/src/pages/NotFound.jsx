import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="animate-fade-in" style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🪐 404</div>
      <h1 style={{ fontSize: "28px", color: "#fff", marginBottom: "12px" }}>
        Campus Page Not Found
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: "15px", maxWidth: "460px", margin: "0 auto 28px" }}>
        The link you followed may be broken, or the gig listing has expired and was removed.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
        <Link to="/" className="btn btn-primary">
          Back to CampusGig Home
        </Link>
        <Link to="/jobs" className="btn btn-secondary">
          Explore Gigs
        </Link>
      </div>
    </div>
  );
}
