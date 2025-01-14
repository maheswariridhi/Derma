import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import PatientsPage from "../pages/PatientsPage";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/patients/:id" element={<PatientsPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
