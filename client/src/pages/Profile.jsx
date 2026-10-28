import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AlertBanner from "../components/AlertBanner";

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [college, setCollege] = useState(user?.college || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [skills, setSkills] = useState(user?.skills ? user.skills.join(", ") : "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [github, setGithub] = useState(user?.github || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await updateProfile({
        name: name.trim(),
        college: college.trim(),
        bio: bio.trim(),
        skills: skillsArray,
        phone: phone.trim(),
        github: github.trim()
      });

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "760px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "28px", color: "#fff", fontWeight: "700", marginBottom: "6px" }}>
          Student Profile 👤
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Your profile details are shown to gig posters when you apply for student opportunities.
        </p>
      </div>

      <div className="card" style={{ padding: "32px" }}>
        <AlertBanner type="error" message={error} onClose={() => setError("")} />
        <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />

        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px", paddingBottom: "24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div
            className="user-avatar-circle"
            style={{ width: "64px", height: "64px", fontSize: "24px", boxShadow: "0 0 20px var(--primary-glow)" }}
          >
            {user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <h2 style={{ fontSize: "20px", color: "#fff", marginBottom: "4px" }}>
              {user?.name || "Campus Student"}
            </h2>
            <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              {user?.email} • <span className="badge badge-purple" style={{ fontSize: "11px" }}>{user?.role || "student"}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name & Email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Account ID)</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ""}
                disabled
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              />
              <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                Email cannot be modified directly
              </span>
            </div>
          </div>

          {/* College & Phone */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">College / University</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. University School of Engineering"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone / WhatsApp</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* GitHub / Portfolio */}
          <div className="form-group">
            <label className="form-label">Portfolio / GitHub Profile URL</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. https://github.com/username or portfolio link"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
            />
          </div>

          {/* Skills */}
          <div className="form-group">
            <label className="form-label">Skills & Technologies (comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. React, Node.js, Python, Figma, Technical Writing"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
            <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
              Tags displayed on your applications to highlight your strengths
            </span>
          </div>

          {/* Bio */}
          <div className="form-group">
            <label className="form-label">Short Student Bio (About You)</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Write a brief introduction about your major, interests, and what kinds of gigs you love doing..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? "Saving Changes..." : "Save Profile Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
