import React from "react";
import Navbar from "../components/Navbar"; // Path to Navbar component
import Footer from "../components/Footer"; // Path to Footer component

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 p-4 bg-gray-50">{children}</main>

      {/* Footer (optional) */}
      <Footer />
    </div>
  );
};

export default MainLayout;
