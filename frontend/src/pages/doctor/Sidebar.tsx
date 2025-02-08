import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

// Define navigation item type
interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navigation: NavigationItem[] = [
    { name: "Dashboard", href: "/clinic/dashboard", icon: HomeIcon },
    { name: "Patient Database", href: "/clinic/manage-patients", icon: UsersIcon },
    { name: "Appointments", href: "/clinic/appointments", icon: CalendarIcon },
    { name: "Services", href: "/clinic/services", icon: BuildingOfficeIcon },
  ];

  return (
    <div className="h-full bg-white p-4 shadow-lg">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-green-600">DermaAI</h1>
      </div>
      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`${
                isActive
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            >
              <item.icon
                className={`${
                  isActive ? "text-gray-500" : "text-gray-400 group-hover:text-gray-500"
                } mr-3 flex-shrink-0 h-6 w-6`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;

