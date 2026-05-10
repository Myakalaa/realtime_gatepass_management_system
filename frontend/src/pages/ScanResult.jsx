import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { scanPass } from "../services/api";
import "./AuthForms.css";

const ScanResult = () => {
  const { passId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const performScan = async () => {
      try {
        const res = await scanPass(passId);
        setResult(res.data);
      } catch (err) {
        const detail = err.response?.data?.detail || err.message || "Network Error";
        setError(detail);
      } finally {
        setLoading(false);
      }
    };
    if (passId) performScan();
  }, [passId]);

  if (loading) return (
    <div style={outerStyle}>
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "50px" }}>⏳</div>
        <h2 style={{ marginTop: "15px", color: "#0f172a" }}>Verifying Pass...</h2>
        <p style={{ color: "#64748b" }}>Please wait</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={outerStyle}>
      <div className="auth-card" style={{ textAlign: "center", borderTop: "6px solid #ef4444" }}>
        <div style={{ fontSize: "60px" }}>❌</div>
        <h2 style={{ color: "#ef4444", fontWeight: "950" }}>Scan Failed</h2>
        <p style={{ color: "#64748b", margin: "10px 0 25px" }}>{error}</p>
        <button onClick={() => window.history.back()} style={btnStyle("#64748b")}>
          Go Back & Try Again
        </button>
      </div>
    </div>
  );

  // ── Map status to UI ──────────────────────────────────────────
  const config = {
    exit_recorded: {
      icon: "🚶",
      color: "#38bdf8",
      title: "EXIT RECORDED",
      subtitle: "Student has left campus",
    },
    entry_recorded: {
      icon: "✅",
      color: "#10b981",
      title: "ENTRY RECORDED",
      subtitle: "Student has returned on time",
    },
    fine_due: {
      icon: "⚠️",
      color: "#f59e0b",
      title: "FINE DUE",
      subtitle: "Student returned late — payment required",
    },
    completed: {
      icon: "🏁",
      color: "#6366f1",
      title: "COMPLETED",
      subtitle: "This pass has already been used",
    },
    pending: {
      icon: "⏳",
      color: "#f59e0b",
      title: "PENDING",
      subtitle: "Pass is awaiting admin approval",
    },
    rejected: {
      icon: "🚫",
      color: "#ef4444",
      title: "REJECTED",
      subtitle: "This pass has been rejected by admin",
    },
  };

  const status = result?.status?.toLowerCase() || "pending";
  const ui = config[status] || {
    icon: "❓",
    color: "#94a3b8",
    title: status.toUpperCase(),
    subtitle: result?.message || "",
  };

  return (
    <div style={outerStyle}>
      <div className="auth-card" style={{ maxWidth: "480px", textAlign: "center", borderTop: `8px solid ${ui.color}` }}>
        
        {/* Icon & Title */}
        <div style={{ fontSize: "70px", marginBottom: "10px" }}>{ui.icon}</div>
        <h1 style={{ fontSize: "32px", fontWeight: "950", color: ui.color, letterSpacing: "-0.03em" }}>
          {ui.title}
        </h1>
        <p style={{ color: "#64748b", fontWeight: "600", marginBottom: "25px" }}>{ui.subtitle}</p>

        {/* Fine Box */}
        {status === "fine_due" && (
          <div style={{
            background: "#fff7ed",
            border: "2px solid #fb923c",
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "25px"
          }}>
            <div style={{ fontSize: "11px", fontWeight: "900", color: "#ea580c", textTransform: "uppercase", marginBottom: "8px" }}>
              ⚠️ Late Return Penalty
            </div>
            <div style={{ fontSize: "48px", fontWeight: "950", color: "#c2410c", lineHeight: 1 }}>
              ₹{result.fine_amount}
            </div>
            <div style={{ fontSize: "13px", color: "#9a3412", marginTop: "8px", fontWeight: "700" }}>
              {result.late_minutes} minutes late · Grace period: 15 mins
            </div>
          </div>
        )}

        {/* Info Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "25px" }}>
          <div style={infoBox}>
            <div style={infoLabel}>Pass ID</div>
            <div style={infoValue}>#{passId}</div>
          </div>
          <div style={infoBox}>
            <div style={infoLabel}>Scan Time</div>
            <div style={infoValue}>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
          {result?.student_name && (
            <div style={{ ...infoBox, gridColumn: "span 2" }}>
              <div style={infoLabel}>Student</div>
              <div style={infoValue}>{result.student_name}</div>
            </div>
          )}
          {result?.expected_return && (
            <div style={{ ...infoBox, gridColumn: "span 2" }}>
              <div style={infoLabel}>Expected Return</div>
              <div style={infoValue}>{new Date(result.expected_return).toLocaleString()}</div>
            </div>
          )}
        </div>

        {/* Message */}
        {result?.message && (
          <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "14px",
            fontSize: "14px",
            fontWeight: "700",
            color: "#334155",
            marginBottom: "25px"
          }}>
            {result.message}
          </div>
        )}

        <button onClick={() => window.history.back()} style={btnStyle(ui.color)}>
          Close & Continue
        </button>
      </div>
    </div>
  );
};

const outerStyle = {
  minHeight: "80vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  background: "#f8fafc",
};

const infoBox = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "14px",
  textAlign: "left",
};

const infoLabel = {
  fontSize: "10px",
  fontWeight: "900",
  color: "#94a3b8",
  textTransform: "uppercase",
  marginBottom: "4px",
};

const infoValue = {
  fontSize: "16px",
  fontWeight: "800",
  color: "#1e293b",
};

const btnStyle = (color) => ({
  width: "100%",
  padding: "16px",
  background: color,
  color: "white",
  border: "none",
  borderRadius: "16px",
  fontSize: "14px",
  fontWeight: "800",
  textTransform: "uppercase",
  cursor: "pointer",
});

export default ScanResult;
