import React from "react";
import { observability } from "../services/observability.js";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    observability.captureException(error, { componentStack: errorInfo?.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "24px", color: "#e53e3e", background: "#fff5f5", borderRadius: "8px", border: "1px solid #feb2b2", margin: "20px 0" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "8px" }}>⚠️ Ocorreu um erro no componente do Calendário:</h3>
          <p style={{ fontSize: "0.9rem", color: "#742a2a", fontWeight: "bold" }}>{String(this.state.error?.message || this.state.error)}</p>
          <pre style={{ fontSize: "0.75rem", background: "#fff", padding: "12px", borderRadius: "4px", marginTop: "12px", overflowX: "auto" }}>
            {String(this.state.error?.stack)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
