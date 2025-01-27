import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PatientNavbar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname.includes(path) ? 
      'bg-blue-700 text-white' : 
      'text-blue-100 hover:bg-blue-600';
  };

  return (
    <nav className="bg-blue-500 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/patient" className="text-white text-xl font-bold">
              DermaAI
            </Link>
          </div>
          
          <div className="flex space-x-4">
            <Link
              to="/patient/queue"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/queue')}`}
            >
              Queue Status
            </Link>
            <Link
              to="/patient/book"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/book')}`}
            >
              Book Appointment
            </Link>
            <Link
              to="/patient/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/profile')}`}
            >
              Profile
            </Link>
            <Link
              to="/patient/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard')}`}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PatientNavbar; 