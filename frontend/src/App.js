import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ApplyPass from "./pages/ApplyPass";
import PassList from "./pages/PassList";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAnalytics from "./components/AdminAnalytics";

// Scan Result Page (Public)
import ScanResult from "./pages/ScanResult";

// Gate/Security Page
import GateScanner from "./pages/GateScanner";

// Route Protection
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const navLinkStyle = {
  textDecoration: 'none',
  color: '#475569',
  fontSize: '13px',
  fontWeight: '800',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  padding: '8px 16px',
  borderRadius: '10px',
  transition: 'all 0.2s',
  background: '#f8fafc',
  border: '1px solid #e2e8f0'
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">

        {/* Premium Header Title */}
        <div style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
          color: 'white', 
          padding: '40px 0', 
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '38px', 
            fontWeight: '950', 
            letterSpacing: '-0.05em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px'
          }}>
            <span style={{ 
              background: '#38bdf8', 
              color: '#0f172a', 
              padding: '5px 12px', 
              borderRadius: '12px',
              fontSize: '24px'
            }}>🛂</span>
            GATEPASS <span style={{ color: '#38bdf8' }}>SYSTEM</span>
          </h1>
          <p style={{ 
            margin: '10px 0 0', 
            fontSize: '12px', 
            fontWeight: '700', 
            color: '#94a3b8', 
            textTransform: 'uppercase', 
            letterSpacing: '0.4em' 
          }}>
            Smart Campus Access Control
          </p>
        </div>

        {/* Navigation */}
        <nav style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px', 
          marginBottom: '30px',
          padding: '10px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <Link to="/" style={navLinkStyle}>Dashboard</Link>
          <Link to="/apply" style={navLinkStyle}>Apply Pass</Link>
          <Link to="/passes" style={navLinkStyle}>Pass List</Link>
          <Link to="/gate-scanner" style={{ ...navLinkStyle, color: "#0ea5e9" }}>Gate Scanner</Link>
          <Link to="/login" style={navLinkStyle}>Login</Link>
          <Link to="/register" style={navLinkStyle}>Register</Link>

          <Link to="/admin-login" style={{ ...navLinkStyle, color: "#ef4444", fontWeight: 'bold' }}>
            Admin Login
          </Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/apply" element={<ApplyPass />} />
          <Route path="/passes" element={<PassList />} />
          <Route path="/gate-scanner" element={<GateScanner />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Login */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* QR Scan Result (Public) */}
          <Route path="/scan-result/:passId" element={<ScanResult />} />

          {/* Protected Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminRoute>
                <AdminAnalytics />
              </AdminRoute>
            }
          />
        </Routes>

      </div>
    </QueryClientProvider>
  );
}

export default App;
