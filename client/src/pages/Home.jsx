import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/apiClient";
import JobCard from "../components/JobCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [stats, setStats] = useState({ totalJobs: 0, totalApplications: 0, categoryCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [jobsData, statsData] = await Promise.all([
          api.getJobs({ limit: 6, sortBy: "newest" }),
          api.getStats()
        ]);
        setFeaturedJobs(jobsData.jobs || []);
        setStats(statsData || { totalJobs: 0, totalApplications: 0, categoryCount: 0 });
      } catch (err) {
        console.error("Home data error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/jobs");
    }
  };

  const categories = [
    { name: "Web Development", icon: "💻", count: "React, Node, APIs" },
    { name: "Design & Creative", icon: "🎨", count: "Figma, Posters, UI/UX" },
    { name: "Tutoring & Academics", icon: "📚", count: "DSA, Math, Python" },
    { name: "Writing & Content", icon: "✍️", count: "Blogs, Reports, Copy" },
    { name: "Video & Audio", icon: "🎬", count: "Reels, Editing, Sound" },
    { name: "Campus Services", icon: "🏫", count: "Events, Labs, Admin" }
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section style={{ textAlign: "center", padding: "40px 10px 50px", maxWidth: "860px", margin: "0 auto" }}>
        <div className="badge badge-purple" style={{ marginBottom: "16px", padding: "6px 14px" }}>
          🚀 The Verified Student Freelance Network
        </div>

        <h1 style={{ fontSize: "44px", fontWeight: "800", color: "#fff", lineHeight: 1.2, marginBottom: "16px" }}>
          Find Campus Gigs. Earn Cash. <br />
          <span style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Build Real Experience.
          </span>
        </h1>

        <p style={{ color: "var(--text-muted)", fontSize: "17px", lineHeight: 1.6, marginBottom: "32px", maxWidth: "680px", margin: "0 auto 32px" }}>
          CampusGig connects university students for peer-to-peer freelance gigs, campus club projects, and micro-internships. No corporate red tape — just real work and direct student collaboration.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "10px", maxWidth: "580px", margin: "0 auto 28px", background: "var(--bg-card)", padding: "8px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search gigs (e.g. React, Tutoring, Poster, Node)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: "none", background: "transparent", padding: "10px 14px" }}
          />
          <button type="submit" className="btn btn-primary">
            Search Gigs
          </button>
        </form>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <Link to="/jobs" className="btn btn-secondary">
            Browse All Gigs →
          </Link>
          <Link to="/post-job" className="btn btn-outline">
            + Post a Student Gig
          </Link>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="stats-grid" style={{ marginBottom: "50px" }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(139, 92, 246, 0.15)", color: "var(--primary)" }}>
            💼
          </div>
          <div>
            <div className="stat-value">{stats.totalJobs || "8+"}</div>
            <div className="stat-label">Active Open Gigs</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(236, 72, 153, 0.15)", color: "var(--secondary)" }}>
            📝
          </div>
          <div>
            <div className="stat-value">{stats.totalApplications || "0"}</div>
            <div className="stat-label">Student Applications</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--success)" }}>
            🏷️
          </div>
          <div>
            <div className="stat-value">{stats.categoryCount || "7"}</div>
            <div className="stat-label">Gig Categories</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.15)", color: "var(--info)" }}>
            ⚡
          </div>
          <div>
            <div className="stat-value">100% Local</div>
            <div className="stat-label">Verified Campus Community</div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section style={{ marginBottom: "50px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "24px", color: "#fff", fontWeight: "700" }}>Popular Categories</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Explore opportunities tailored to student skillsets</p>
          </div>
          <Link to="/jobs" style={{ color: "var(--primary)", fontSize: "14px", fontWeight: "600" }}>
            View all categories →
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="card card-hover"
              onClick={() => navigate(`/jobs?category=${encodeURIComponent(cat.name)}`)}
              style={{ cursor: "pointer", padding: "18px", textAlign: "center" }}
            >
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>{cat.icon}</div>
              <h4 style={{ color: "#fff", fontSize: "15px", marginBottom: "4px" }}>{cat.name}</h4>
              <p style={{ color: "var(--text-dim)", fontSize: "12px" }}>{cat.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Gigs Section */}
      <section style={{ marginBottom: "60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "24px", color: "#fff", fontWeight: "700" }}>Featured Campus Gigs</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Recently posted opportunities from students and student clubs</p>
          </div>
          <Link to="/jobs" className="btn btn-secondary btn-sm">
            See All Gigs ({stats.totalJobs || 0})
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading latest opportunities..." />
        ) : featuredJobs.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: "16px" }}>No gigs found yet.</p>
            <Link to="/post-job" className="btn btn-primary">Post the First Gig</Link>
          </div>
        ) : (
          <div className="jobs-grid">
            {featuredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* How it works banner */}
      <section className="card" style={{ padding: "36px", background: "linear-gradient(180deg, var(--bg-card), #12131d)", border: "1px solid var(--border-light)" }}>
        <h2 style={{ textAlign: "center", fontSize: "24px", color: "#fff", marginBottom: "30px" }}>
          How CampusGig Works for Students
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontWeight: "bold" }}>
              1
            </div>
            <h4 style={{ color: "#fff", marginBottom: "6px" }}>Discover or Post</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Find part-time work matching your schedule, or post a task if your project needs an extra pair of hands.
            </p>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--secondary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontWeight: "bold" }}>
              2
            </div>
            <h4 style={{ color: "#fff", marginBottom: "6px" }}>Apply in Seconds</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Submit a short cover letter and your proposed rate directly to the gig creator. Track application status live.
            </p>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "var(--success)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontWeight: "bold" }}>
              3
            </div>
            <h4 style={{ color: "#fff", marginBottom: "6px" }}>Deliver & Build Cred</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Complete the project, earn direct payment, and showcase verified work on your CampusGig profile and resume.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
