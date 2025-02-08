import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MdDashboard, MdMedicalServices } from "react-icons/md"; // Material Design icons
import { FaUserInjured } from "react-icons/fa"; // Font Awesome icons
import { BsCalendarCheck } from "react-icons/bs"; // Bootstrap icons

// Define Props interface
interface MainLayoutProps {
  children: React.ReactNode;
}

// Define NavigationItem interface
interface NavigationItem {
  path: string;
  label: string;
  icon: JSX.Element;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  console.log("Current location:", location.pathname); // Debug log

  const navigationItems: NavigationItem[] = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <MdDashboard className="w-6 h-6" />,
    },
    {
      path: "/patients",
      label: "Patient Database",
      icon: <FaUserInjured className="w-6 h-6" />,
    },
    {
      path: "/appointments",
      label: "Appointments",
      icon: <BsCalendarCheck className="w-6 h-6" />,
    },
    {
      path: "/clinic-services",
      label: "Services",
      icon: <MdMedicalServices className="w-6 h-6" />,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">DermaAi</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              console.log(`${item.label}: ${item.path} - Active: ${isActive}`); // Debug log

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => console.log("Clicked:", item.path)} // Debug log
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
};

export default MainLayout;
