
import { useState } from "react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      setMessage("Cannot connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: "420px",
      margin: "80px auto",
      padding: "30px",
      borderRadius: "16px",
      boxShadow: "0 4px 20px #0002"
    }}>
      <h1>Join CampusGig 💜</h1>
      <p>Create your student account</p>

      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ width: "100%", padding: "12px", marginBottom: "12px", boxSizing: "border-box" }}
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: "12px", marginBottom: "12px", boxSizing: "border-box" }}
        />

        <input
          type="password"
          placeholder="Password (minimum 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
          style={{ width: "100%", padding: "12px", marginBottom: "16px", boxSizing: "border-box" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: "#7041c8",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <p role="status">{message}</p>
    </div>
  );
}
