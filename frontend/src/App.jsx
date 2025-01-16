import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import AppointmentsPage from './pages/AppointmentsPage';
import PatientDatabasePage from './pages/PatientDatabasePage';
import PatientWorkflow from './pages/PatientWorkflow';
import PatientsPage from './pages/PatientsPage';
import MainLayout from './layouts/MainLayout';
import ClinicServicesPage from './pages/ClinicServicesPage';

const App = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/patients" element={<PatientDatabasePage />} />
          <Route path="/patient/:id" element={<PatientsPage />} />
          <Route path="/patient/:id/workflow" element={<PatientWorkflow />} />
          <Route path="/services" element={<ClinicServicesPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default App;