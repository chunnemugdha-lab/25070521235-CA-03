import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="brand-logo" onClick={() => setMobileOpen(false)}>
          <div className="brand-icon">CG</div>
          <span>CampusGig</span>
        </Link>

        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>

        <div className={`nav-links ${mobileOpen ? "open" : ""}`}>
          <Link
            to="/jobs"
            className={`nav-link ${isActive("/jobs") ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            Explore Gigs
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>

              <Link
                to="/my-applications"
                className={`nav-link ${isActive("/my-applications") ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                My Applications
              </Link>

              <Link
                to="/my-jobs"
                className={`nav-link ${isActive("/my-jobs") ? "active" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                My Posted Gigs
              </Link>

              <Link
                to="/post-job"
                className={`btn btn-primary btn-sm`}
                onClick={() => setMobileOpen(false)}
              >
                + Post a Gig
              </Link>
            </>
          ) : (
            <Link
              to="/post-job"
              className={`nav-link ${isActive("/post-job") ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              Post a Gig
            </Link>
          )}
        </div>

        <div className="nav-actions">
          {isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Link
                to="/profile"
                className="user-badge"
                title="View Profile"
                style={{ textDecoration: "none" }}
              >
                <div className="user-avatar-circle">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span>{user?.name?.split(" ")[0] || "Student"}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log out of account"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Join CampusGig
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
