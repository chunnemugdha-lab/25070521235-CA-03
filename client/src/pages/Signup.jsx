import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AlertBanner from "../components/AlertBanner";

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [college, setCollege] = useState("");
  const [role, setRole] = useState("student");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        college: college.trim() || "Campus Student",
        role
      });

      setSuccess(res.message || "Signup successful! Welcome to CampusGig.");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      setError(err.message || "Cannot connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "460px", margin: "40px auto" }}>
      <div className="card" style={{ padding: "36px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            className="brand-icon"
            style={{ width: "48px", height: "48px", fontSize: "22px", margin: "0 auto 12px" }}
          >
            CG
          </div>
          <h1 style={{ fontSize: "24px", color: "#fff", fontWeight: "700", marginBottom: "6px" }}>
            Join CampusGig 💜
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Create your student account
          </p>
        </div>

        <AlertBanner type="error" message={error} onClose={() => setError("")} />
        <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Alex Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. alex@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">College / University Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. School of Engineering & Technology"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Primary Interest</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student Freelancer (Looking to work on gigs)</option>
              <option value="recruiter">Campus Organizer / Poster (Looking to post gigs)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Password (minimum 8 characters) *</label>
            <input
              type="password"
              className="form-input"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input
              type="password"
              className="form-input"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: "8px", padding: "12px", background: "#7041c8" }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-subtle)", fontSize: "14px", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: "600" }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
