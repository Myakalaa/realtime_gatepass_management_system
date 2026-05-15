import React, { useEffect, useState } from "react";
import { getMyPasses, BASE_URL } from "../services/api";
import "./PassList.css";

const PassList = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPasses()
      .then((res) => {
        setPasses(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("PASS LIST ERROR:", err);
        setPasses([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === "APPROVED") return <span className="status-badge status-approved">Activated</span>;
    if (s === "PENDING") return <span className="status-badge status-pending">Awaiting Approval</span>;
    if (s === "REJECTED") return <span className="status-badge status-rejected">Rejected</span>;
    if (s === "COMPLETED") return <span className="status-badge status-completed">Completed</span>;
    return <span className="status-badge">{status}</span>;
  };

  return (
    <div className="pass-list-container">
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', margin: 0 }}>My Gate Passes</h1>
        <p style={{ color: '#64748b', fontWeight: '500' }}>Manage and track your exit requests</p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading your passes...</div>
      ) : passes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '30px' }}>
          <span style={{ fontSize: '50px' }}>📭</span>
          <h3 style={{ margin: '20px 0 10px', color: '#1e293b' }}>No passes found</h3>
          <p style={{ color: '#64748b' }}>Apply for a pass to see it here.</p>
        </div>
      ) : (
        <div className="passes-grid">
          {passes.map((p) => (
            <div key={p.id} className="pass-card">
              <div className="pass-header">
                <div>
                  <div className="pass-id">PASS #{p.id}</div>
                  <h3 className="pass-purpose">{p.purpose || "General Exit"}</h3>
                  {getStatusBadge(p.status)}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="info-label">Type</div>
                  <div className="info-value" style={{ color: '#6366f1' }}>{p.pass_type}</div>
                </div>
              </div>

              <div className="pass-body">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Student Name</span>
                    <span className="info-value">{p.student_name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Department</span>
                    <span className="info-value">{p.department}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Exit Time</span>
                    <span className="info-value">{formatDateTime(p.out_time)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Return By</span>
                    <span className="info-value">{formatDateTime(p.in_time)}</span>
                  </div>
                </div>

                <div className="qr-section">
                  {(p.status === "APPROVED" || p.status === "ACTIVATED" || p.status === "COMPLETED") && p.qr_code_path ? (
                    <>
                      <img
                        src={p.qr_code_path.startsWith("http") ? p.qr_code_path : `${BASE_URL}${p.qr_code_path}`}
                        alt="QR Code"
                        className="qr-image"
                      />
                      <span className="scan-text">Scan at Gate</span>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '30px', margin: '10px 0' }}>🔒</div>
                      <span className="scan-text" style={{ color: '#f59e0b' }}>Waiting for Activation</span>
                    </>
                  )}
                </div>
              </div>

              {["COMPLETED", "APPROVED", "ACTIVATED"].includes(p.status?.toUpperCase()) && (
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  {p.qr_code_path && (
                    <div style={{ textAlign: 'center' }}>
                      <img
                        src={p.qr_code_path.startsWith("http") ? p.qr_code_path : `${BASE_URL}${p.qr_code_path}`}
                        alt="QR Code"
                        style={{ width: '80px', height: '80px', borderRadius: '10px', border: '2px solid #e2e8f0' }}
                      />
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', marginTop: '4px' }}>PASS QR</div>
                    </div>
                  )}
                  <a
                    href={`${BASE_URL}/receipts/download/${p.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      display: 'inline-block',
                      background: '#0f172a', 
                      color: 'white', 
                      padding: '10px 20px', 
                      borderRadius: '12px', 
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: '800'
                    }}
                  >
                    📥 DOWNLOAD RECEIPT
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PassList;