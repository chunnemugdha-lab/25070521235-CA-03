import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/apiClient";
import JobCard from "../components/JobCard";
import LoadingSpinner from "../components/LoadingSpinner";
import AlertBanner from "../components/AlertBanner";

export default function BrowseJobs() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters from URL query params
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "All";
  const jobType = searchParams.get("jobType") || "All";
  const locationType = searchParams.get("locationType") || "All";
  const sortBy = searchParams.get("sortBy") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Local inputs for search bar
  const [searchInput, setSearchInput] = useState(search);

  const categories = [
    "All",
    "Web Development",
    "Design & Creative",
    "Writing & Content",
    "Tutoring & Academics",
    "Video & Audio",
    "Marketing & Social Media",
    "Campus Services",
    "Other"
  ];

  const jobTypes = ["All", "Freelance", "Part-time", "One-time Task", "Internship"];
  const locationTypes = ["All", "Remote", "On-Campus", "Hybrid"];

  const updateFilters = (newParams) => {
    const current = Object.fromEntries(searchParams.entries());
    const merged = { ...current, ...newParams, page: "1" };

    // Remove empty or 'All'
    Object.keys(merged).forEach((key) => {
      if (!merged[key] || merged[key] === "All") {
        delete merged[key];
      }
    });

    setSearchParams(merged);
  };

  useEffect(() => {
    setSearchInput(search);
    async function fetchJobs() {
      setLoading(true);
      setError("");
      try {
        const data = await api.getJobs({
          search,
          category,
          jobType,
          locationType,
          sortBy,
          page,
          limit: 12
        });
        setJobs(data.jobs || []);
        setPagination(data.pagination || { total: 0, page: 1, limit: 12, totalPages: 1 });
      } catch (err) {
        setError(err.message || "Failed to load gigs. Please check your backend connection.");
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "32px", color: "#fff", fontWeight: "700", marginBottom: "8px" }}>
          Explore Student Gigs 🎓
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
          Discover freelance opportunities, club assignments, and campus gigs posted by peers.
        </p>
      </div>

      <AlertBanner type="error" message={error} onClose={() => setError("")} />

      {/* Main Browse Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "24px", alignItems: "start" }}>
        {/* Filters Sidebar */}
        <aside className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", color: "#fff", margin: 0 }}>Filter Gigs</h3>
            <button
              onClick={handleClearFilters}
              style={{ background: "transparent", border: "none", color: "var(--primary)", fontSize: "12px", cursor: "pointer" }}
            >
              Reset
            </button>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => updateFilters({ category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Job Type */}
          <div className="form-group">
            <label className="form-label">Gig Type</label>
            <select
              className="form-select"
              value={jobType}
              onChange={(e) => updateFilters({ jobType: e.target.value })}
            >
              {jobTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Location Type */}
          <div className="form-group">
            <label className="form-label">Workplace</label>
            <select
              className="form-select"
              value={locationType}
              onChange={(e) => updateFilters({ locationType: e.target.value })}
            >
              {locationTypes.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Sort By</label>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => updateFilters({ sortBy: e.target.value })}
            >
              <option value="newest">Newest First</option>
              <option value="budget-high">Budget: High to Low</option>
              <option value="budget-low">Budget: Low to High</option>
              <option value="deadline">Approaching Deadline</option>
            </select>
          </div>
        </aside>

        {/* Gigs Content Area */}
        <main>
          {/* Top Search bar */}
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input
              type="text"
              className="form-input"
              placeholder="Filter by keyword (e.g. Python, Design, Tutor)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Filter
            </button>
          </form>

          {/* Active filters summary */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", color: "var(--text-muted)", fontSize: "14px" }}>
            <span>
              Showing <strong style={{ color: "#fff" }}>{pagination.total}</strong> active gigs
              {category !== "All" && ` in ${category}`}
              {jobType !== "All" && ` (${jobType})`}
            </span>
          </div>

          {loading ? (
            <LoadingSpinner message="Searching student opportunities..." />
          ) : jobs.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "50px 20px" }}>
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
              <h3 style={{ color: "#fff", marginBottom: "6px" }}>No gigs found</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "20px" }}>
                Try adjusting your search keywords or clearing active category filters.
              </p>
              <button onClick={handleClearFilters} className="btn btn-secondary btn-sm">
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="jobs-grid">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "32px" }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={pagination.page <= 1}
                    onClick={() => {
                      const cur = Object.fromEntries(searchParams.entries());
                      setSearchParams({ ...cur, page: String(pagination.page - 1) });
                    }}
                  >
                    ← Previous
                  </button>

                  <span style={{ alignSelf: "center", fontSize: "13px", color: "var(--text-muted)", padding: "0 8px" }}>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => {
                      const cur = Object.fromEntries(searchParams.entries());
                      setSearchParams({ ...cur, page: String(pagination.page + 1) });
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
