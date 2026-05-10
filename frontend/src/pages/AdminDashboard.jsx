import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllPasses,
  approvePass,
  rejectPass,
  deletePass,
  BASE_URL
} from "../services/api";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPasses();
    const interval = setInterval(loadPasses, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadPasses = async () => {
    try {
      const res = await getAllPasses();
      setPasses(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      console.error("Failed to load passes:", err);
      setError("Failed to sync with server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this gate pass?")) return;
    try {
      await approvePass(id);
      loadPasses();
    } catch (err) {
      alert("Approval failed: " + (err.response?.data?.detail || "Server Error"));
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this pass?")) return;
    try {
      await rejectPass(id);
      loadPasses();
    } catch (err) {
      alert("Rejection failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this record?")) return;
    try {
      await deletePass(id);
      loadPasses();
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return { date: "N/A", time: "" };
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getStatusBadge = (status) => {
    const s = status?.toUpperCase();
    if (s === "APPROVED") return <span className="badge badge-approved">Activated</span>;
    if (s === "PENDING") return <span className="badge badge-pending">Pending</span>;
    if (s === "REJECTED") return <span className="badge badge-rejected">Rejected</span>;
    return <span className="badge">{status}</span>;
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Admin Control Panel</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '5px' }}>Security & Gate Access Management</p>
        </div>
        <div className="status-indicator" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Link to="/admin/analytics" className="btn" style={{ background: '#3b82f6', color: 'white', textDecoration: 'none', padding: '8px 16px', borderRadius: '8px' }}>
            📊 View Analytics
          </Link>
          <div>
            <span className="dot"></span>
            System Live
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '12px', marginBottom: '20px', fontWeight: 'bold' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Pass ID</th>
              <th>Student Info</th>
              <th>Dept</th>
              <th>Mobile</th>
              <th>In Time</th>
              <th>Out Time</th>
              <th>Status</th>
              <th>QR Pass</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && passes.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '50px' }}>Loading...</td>
              </tr>
            ) : passes.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>No records found.</td>
              </tr>
            ) : (
              passes.map((p) => {
                const inTime = formatDateTime(p.in_time);
                const outTime = formatDateTime(p.out_time);
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 'bold', color: '#94a3b8' }}>#{p.id}</td>
                    <td>
                      <div className="student-info">
                        <span className="student-name">{p.student_name}</span>
                        <span className="student-id">{p.student_id}</span>
                      </div>
                    </td>
                    <td><span className="badge" style={{ background: '#f1f5f9' }}>{p.department}</span></td>
                    <td style={{ fontSize: '12px', fontWeight: '600' }}>{p.mobile_number}</td>
                    <td>
                      <div className="time-box">
                        <span className="date-part">{inTime.date}</span>
                        <span className="time-part">{inTime.time}</span>
                      </div>
                    </td>
                    <td>
                      <div className="time-box">
                        <span className="date-part">{outTime.date}</span>
                        <span className="time-part">{outTime.time}</span>
                      </div>
                    </td>
                    <td>{getStatusBadge(p.status)}</td>
                    <td>
                      {p.qr_code_path ? (
                        <img
                          src={p.qr_code_path.startsWith("http") ? p.qr_code_path : `${BASE_URL}${p.qr_code_path}`}
                          alt="QR"
                          className="qr-thumb"
                          onClick={() => window.open(p.qr_code_path.startsWith("http") ? p.qr_code_path : `${BASE_URL}${p.qr_code_path}`, '_blank')}
                        />
                      ) : (
                        <span className="qr-placeholder">Pending Approval</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        {p.status === "PENDING" && (
                          <>
                            <button onClick={() => handleApprove(p.id)} className="btn btn-approve">Clear</button>
                            <button onClick={() => handleReject(p.id)} className="btn btn-reject">Reject</button>
                          </>
                        )}
                        <button onClick={() => handleDelete(p.id)} className="btn btn-delete">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;