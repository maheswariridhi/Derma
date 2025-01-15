import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/DashboardPage";
import PatientWorkflow from "../pages/PatientWorkflow";
import PatientDatabase from "../pages/PatientDatabasePage";
import ClinicServices from "../pages/ClinicServicesPage";
import AppointmentsPage from "../pages/AppointmentsPage";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/patient/:id" element={<MainLayout><PatientWorkflow /></MainLayout>} />
        <Route path="/patients" element={<MainLayout><PatientDatabase /></MainLayout>} />
        <Route path="/clinic-services" element={<MainLayout><ClinicServices /></MainLayout>} />
        <Route path="/appointments" element={<MainLayout><AppointmentsPage /></MainLayout>} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
