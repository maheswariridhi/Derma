import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MdDashboard, MdMedicalServices, MdSettings, MdLogout, MdSmartToy } from "react-icons/md"; // Material Design icons
import { FaUserInjured } from "react-icons/fa"; // Font Awesome icons
import { BsCalendarCheck } from "react-icons/bs"; // Bootstrap icons

// Define Props interface
interface MainLayoutProps {
  children: React.ReactNode;
  showWorkflow?: boolean;
  contentClassName?: string;
}

// Define NavigationItem interface
interface NavigationItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showWorkflow = false,
  contentClassName = "",
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems: NavigationItem[] = [
    {
      path: "/clinic/dashboard",
      label: "Dashboard",
      icon: <MdDashboard className="w-5 h-5" />,
    },
    {
      path: "/clinic/manage-patients",
      label: "Patient Database",
      icon: <FaUserInjured className="w-5 h-5" />,
    },
    {
      path: "/clinic/appointments",
      label: "Appointments",
      icon: <BsCalendarCheck className="w-5 h-5" />,
    },
    {
      path: "/clinic/services",
      label: "Services",
      icon: <MdMedicalServices className="w-5 h-5" />,
    },
    {
      path: "/clinic/settings",
      label: "Settings",
      icon: <MdSettings className="w-5 h-5" />,
    },
  ];

  const handleLogout = () => {
    // Here you would clear any authentication tokens/state
    localStorage.clear();
    sessionStorage.clear();
    // Navigate to login page or root
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Sidebar - Fixed */}
      <div className="w-64 fixed h-full z-20 flex flex-col bg-gray-50 border-r border-gray-200">
        <div className="p-6">
          <Link to="/clinic/dashboard" className="block">
            <h1 className="text-2xl font-semibold text-teal-600">DermaAI</h1>
          </Link>
        </div>
        
        <nav className="mt-2 px-3 flex-1">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path || 
                             (item.path !== '/clinic/dashboard' && location.pathname.startsWith(item.path));
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "text-teal-700 font-medium"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className={`mr-3 ${isActive ? "text-teal-500" : "text-gray-400"}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout button at bottom of sidebar */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-600 hover:text-red-600 rounded-lg transition-colors"
          >
            <MdLogout className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area - With offset for fixed sidebar */}
      <div className="flex-1 ml-64">
        <div className={`h-full ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
