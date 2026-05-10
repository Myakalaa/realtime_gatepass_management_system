import React from "react";
import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  const token = localStorage.getItem("admin_token");
  const role = localStorage.getItem("admin_role");

  if (!token || role !== "admin") {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}

export default AdminRoute;
