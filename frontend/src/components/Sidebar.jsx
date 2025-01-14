import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">DJ Dental</h1>
      <nav className="space-y-2">
        <Link 
          to="/" 
          className="block text-black hover:underline"
        >
          Dashboard
        </Link>
        <Link 
          to="/inbox" 
          className="block text-black hover:underline"
        >
          Inbox
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar; 