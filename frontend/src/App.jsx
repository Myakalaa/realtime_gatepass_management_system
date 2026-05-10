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
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

// Route Protection
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ textAlign: "center", marginTop: "30px" }}>

        {/* Title */}
        <h1>Gate Pass Management System</h1>

        {/* Navigation */}
        <nav style={{ marginBottom: "30px" }}>
          <Link to="/" style={{ margin: "0 10px" }}>Dashboard</Link>
          <Link to="/apply" style={{ margin: "0 10px" }}>Apply Pass</Link>
          <Link to="/passes" style={{ margin: "0 10px" }}>Pass List</Link>
          <Link to="/login" style={{ margin: "0 10px" }}>Login</Link>
          <Link to="/register" style={{ margin: "0 10px" }}>Register</Link>

          {/* Admin ONLY login visible */}
          <Link to="/admin-login" style={{ margin: "0 10px", color: "red" }}>
            Admin Login
          </Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/apply" element={<ApplyPass />} />
          <Route path="/passes" element={<PassList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Login */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Protected Admin Route */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>

      </div>
    </QueryClientProvider>
  );
}

export default App;
