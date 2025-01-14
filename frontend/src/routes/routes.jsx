import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import AppointmentsPage from "../pages/AppointmentsPage";
import PatientsPage from "../pages/PatientsPage";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/patients" element={<PatientsPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
