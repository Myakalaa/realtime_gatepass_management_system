import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/api";
import "./AuthForms.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await adminLogin({ email, password });
      localStorage.setItem("admin_token", res.data.access_token);
      localStorage.setItem("admin_role", res.data.role);
      navigate("/admin");
    } catch (err) {
      alert(err.response?.data?.detail || "Admin login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</div>
        <h2 className="auth-title">Admin Portal</h2>
        <p className="auth-subtitle">Restricted Access - Administrators Only</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@gatepass.com"
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-button">
            Secure Login
          </button>
        </form>

        <div className="auth-footer">
          System encrypted and monitored.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
