import React from "react";
import AppRoutes from "./routes/routes";
import MainLayout from "./layouts/MainLayout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/DashboardPage";
import PatientTreatmentPlan from "./pages/PatientsPage";
import PatientDatabase from "./pages/PatientDatabasePage";
import ClinicServices from "./pages/ClinicServicesPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        } />
        <Route path="/patients/:patientSlug" element={
          <MainLayout>
            <PatientTreatmentPlan />
          </MainLayout>
        } />
        <Route path="/patient-database" element={
          <MainLayout>
            <PatientDatabase />
          </MainLayout>
        } />
        <Route path="/clinic-services" element={
          <MainLayout>
            <ClinicServices />
          </MainLayout>
        } />
        {/* ... other routes ... */}
      </Routes>
    </Router>
  );
};

export default App;
