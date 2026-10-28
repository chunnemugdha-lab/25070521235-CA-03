import React from "react";

export default function AlertBanner({ type = "error", message, onClose }) {
  if (!message) return null;

  const isError = type === "error";

  return (
    <div className={`alert ${isError ? "alert-error" : "alert-success"} animate-fade-in`}>
      <span style={{ fontSize: "16px" }}>{isError ? "⚠️" : "✅"}</span>
      <div style={{ flex: 1 }}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            fontWeight: "bold",
            padding: "0 4px"
          }}
          aria-label="Close message"
        >
          ✕
        </button>
      )}
    </div>
  );
}
