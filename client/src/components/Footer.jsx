import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "24px", marginBottom: "24px", textAlign: "left" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", color: "#fff", fontSize: "16px", marginBottom: "8px" }}>
              <span>CampusGig</span> <span>💜</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", maxWidth: "320px" }}>
              The student-to-student freelance and micro-internship network. Gain verified campus work experience, earn cash, and showcase your skills.
            </p>
          </div>

          <div>
            <h4 style={{ color: "#fff", fontSize: "14px", marginBottom: "10px" }}>Quick Links</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px" }}>
              <Link to="/jobs" style={{ color: "var(--text-muted)" }}>Explore Gigs</Link>
              <Link to="/post-job" style={{ color: "var(--text-muted)" }}>Post a Gig</Link>
              <Link to="/dashboard" style={{ color: "var(--text-muted)" }}>Student Dashboard</Link>
            </div>
          </div>

          <div>
            <h4 style={{ color: "#fff", fontSize: "14px", marginBottom: "10px" }}>Technical Stack</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              React 19 • Express 5 • Node.js • Local MongoDB • Secure Session Auth
            </p>
            <p style={{ color: "var(--text-dim)", fontSize: "12px", marginTop: "4px" }}>
              Project ID: 25070521235
            </p>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "16px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", fontSize: "12px" }}>
          <span>© {new Date().getFullYear()} CampusGig. All rights reserved.</span>
          <span>College Academic Assessment Demonstration Project</span>
        </div>
      </div>
    </footer>
  );
}
