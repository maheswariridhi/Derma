import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">DermaAI</h1>
        <ul className="flex space-x-4">
          <li>
            <Link to="/" className="hover:text-gray-200">Dashboard</Link>
          </li>
          <li>
            <Link to="/appointments" className="hover:text-gray-200">Appointments</Link>
          </li>
          <li>
            <Link to="/patients" className="hover:text-gray-200">Patients</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
