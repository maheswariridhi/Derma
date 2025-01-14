import React from "react";
import Sidebar from "../components/Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-white">
      <div className="w-64 min-h-screen border-r border-gray-200">
        <Sidebar />
      </div>
      <div className="flex-1 pl-8">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
