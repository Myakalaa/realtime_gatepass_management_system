import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Base navigation (existing)
  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/apply", label: "Apply Pass" },
    { path: "/passes", label: "Pass List" },
  ];

  // Admin extra links (added)
  const adminItems = [
    { path: "/admin", label: "Admin Panel" },
    { path: "/users", label: "Manage Users" },
  ];

  // Merge if admin
  const allNavItems =
    user && user.role === "admin"
      ? [...navItems, ...adminItems]
      : navItems;

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <h1 className="text-2xl font-extrabold tracking-wide drop-shadow-md">
          <Link to="/">GatePass</Link>
        </h1>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex gap-8 text-lg items-center">
          {allNavItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`
                  relative group transition duration-300
                  ${
                    location.pathname === item.path
                      ? "font-bold text-yellow-300"
                      : "text-white"
                  }
                `}
              >
                {item.label}

                <span className="
                  absolute left-0 -bottom-1 w-0 h-[2px]
                  bg-yellow-300 group-hover:w-full
                  transition-all duration-300
                "></span>
              </Link>
            </li>
          ))}

          {/* Auth Area */}
          {!user && (
            <li>
              <Link
                to="/login"
                className="bg-white text-blue-600 px-4 py-1 rounded-lg font-semibold hover:bg-yellow-300 hover:text-black transition"
              >
                Login
              </Link>
            </li>
          )}

          {user && (
            <li className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20 transition"
              >
                {user.name}
              </button>

              {/* Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-lg shadow-lg overflow-hidden">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>

        {/* Mobile Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-blue-700 px-6 pb-4 space-y-3">
          {allNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 border-b border-white/20 ${
                location.pathname === item.path
                  ? "text-yellow-300 font-bold"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          ))}

          {!user && (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block py-2"
            >
              Login
            </Link>
          )}

          {user && (
            <>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="block py-2"
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onLogout();
                }}
                className="block py-2 text-left w-full"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
