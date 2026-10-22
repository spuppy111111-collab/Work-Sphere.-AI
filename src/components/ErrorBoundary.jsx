import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "2rem",
            background: "#f8fafc",
            color: "#0f172a",
            fontFamily: "system-ui, -apple-system, sans-serif",
            textAlign: "center",
          }}
        >
          <div
            style={{
              maxWidth: "520px",
              background: "#ffffff",
              padding: "2.5rem 2rem",
              borderRadius: "16px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#fef2f2",
                color: "#ef4444",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 1.25rem",
                fontSize: "1.75rem",
              }}
            >
              ⚠
            </div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: "800", marginBottom: "0.5rem", color: "#0f172a" }}>
              Something went wrong loading this screen
            </h2>
            <p style={{ fontSize: "0.88rem", color: "#64748b", lineHeight: 1.5, marginBottom: "1.5rem" }}>
              An unexpected error occurred. You can reload the page or return to the main portal.
            </p>
            {this.state.error?.message && (
              <pre
                style={{
                  background: "#f1f5f9",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  color: "#e11d48",
                  textAlign: "left",
                  overflowX: "auto",
                  marginBottom: "1.5rem",
                }}
              >
                {this.state.error.message}
              </pre>
            )}
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: "linear-gradient(135deg, #0284c7, #06b6d4)",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Reload Dashboard
              </button>
              <button
                onClick={this.handleHome}
                style={{
                  background: "#f1f5f9",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
