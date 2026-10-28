import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AlertBanner from "../components/AlertBanner";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "440px", margin: "40px auto" }}>
      <div className="card" style={{ padding: "36px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            className="brand-icon"
            style={{ width: "48px", height: "48px", fontSize: "22px", margin: "0 auto 12px" }}
          >
            CG
          </div>
          <h1 style={{ fontSize: "24px", color: "#fff", fontWeight: "700", marginBottom: "6px" }}>
            Welcome Back 💜
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Log in to your CampusGig student account
          </p>
        </div>

        <AlertBanner type="error" message={error} onClose={() => setError("")} />

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: "8px", padding: "12px" }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-subtle)", fontSize: "14px", color: "var(--text-muted)" }}>
          Don't have an account yet?{" "}
          <Link to="/signup" style={{ color: "var(--primary)", fontWeight: "600" }}>
            Join CampusGig
          </Link>
        </div>

        {/* Demo credentials hint for testing */}
        <div style={{ marginTop: "16px", padding: "12px", background: "var(--bg-input)", borderRadius: "var(--radius-md)", fontSize: "12px", color: "var(--text-dim)", textAlign: "center" }}>
          💡 <strong>Demo Poster:</strong> demoposter@campusgig.edu / CampusGig2026!
        </div>
      </div>
    </div>
  );
}
