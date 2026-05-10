import React, { useState } from "react";
import { registerUser } from "../services/api";
import { Link } from "react-router-dom";
import "./AuthForms.css";

function Register() {
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: ""
  });
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      setMsg("Registration successful! You can now login.");
      setForm({ fullname: "", email: "", password: "" }); 
    } catch (err) {
      setMsg(err.response?.data?.detail || "Error occurred");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>📝</div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join the gatepass management system</p>

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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={form.fullname}
              onChange={(e) => setForm({ ...form, fullname: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="john@university.edu"
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
            Create Account
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Login here</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
