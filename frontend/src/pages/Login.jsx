import React, { useState } from "react";
import { loginUser } from "../services/api";
import { Link } from "react-router-dom";
import "./AuthForms.css";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);
      localStorage.setItem("token", res.data.access_token);
      setMsg("Login successful!");
      window.location.href = "/apply";
    } catch (error) {
      setMsg("Invalid email or password");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎓</div>
        <h2 className="auth-title">Student Login</h2>
        <p className="auth-subtitle">Access your gatepass dashboard</p>

        {msg && (
          <div style={{ 
            background: msg.includes("successful") ? "#dcfce7" : "#fee2e2", 
            color: msg.includes("successful") ? "#166534" : "#991b1b",
            padding: '12px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '700',
            marginBottom: '20px'
          }}>
            {msg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@university.edu"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="auth-button">
            Sign In
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Register Now</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
