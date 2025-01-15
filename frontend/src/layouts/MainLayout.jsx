import React from "react";
import Sidebar from "../components/Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r shadow-md flex-shrink-0 h-screen">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 overflow-y-scroll">
        <div className="max-w-7xl mx-auto p-6">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
