import React from "react";

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        gap: "14px"
      }}
    >
      <div
        className="animate-spin"
        style={{
          width: "36px",
          height: "36px",
          border: "3px solid var(--border-subtle)",
          borderTopColor: "var(--primary)",
          borderRadius: "50%"
        }}
      />
      <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
        {message}
      </span>
    </div>
  );
}
