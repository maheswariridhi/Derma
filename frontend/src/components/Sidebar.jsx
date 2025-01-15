import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/", label: "Dashboard" },
    { path: "/patients", label: "Patient Database" },
    { path: "/appointments", label: "Appointments" },
    { path: "/clinic-services", label: "Clinic Services" },
  ];

  return (
    <div className="h-full p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-green-700">DermaAI</h1>
      </div>
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`block px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
