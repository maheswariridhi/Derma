import React from "react";
import { Link, useLocation } from "react-router-dom";
import { HomeIcon, UsersIcon, CalendarIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Patients', href: '/patients', icon: UsersIcon },
    { name: 'Appointments', href: '/appointments', icon: CalendarIcon },
    { name: 'Services', href: '/services', icon: BuildingOfficeIcon },
  ];

  return (
    <div className="h-full bg-white p-4">
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
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            >
              <item.icon
                className={`${
                  isActive ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'
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
