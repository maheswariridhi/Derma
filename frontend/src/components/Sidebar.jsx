import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8">DJ Dental</h1>
      <nav>
        <ul className="space-y-4">
          <li>
            <Link
              to="/"
              className="block text-gray-700 text-lg hover:bg-gray-100 p-2 rounded"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/inbox"
              className="block text-gray-700 text-lg hover:bg-gray-100 p-2 rounded"
            >
              Inbox
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
