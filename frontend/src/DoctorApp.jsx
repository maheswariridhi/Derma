import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/doctor/DashboardPage';
import AppointmentsPage from './pages/doctor/AppointmentsPage';
import PatientWorkflow from './pages/doctor/PatientWorkflow';
import PatientDatabasePage from './pages/doctor/PatientDatabasePage';
import PatientDetails from './pages/doctor/PatientDetails';
import ClinicServicesPage from './pages/doctor/ClinicServicesPage';
import Sidebar from './pages/doctor/Sidebar';
import PatientInformation from './components/workflow/PatientInformation';
import ReviewAndFinalize from './components/workflow/ReviewAndFinalize';
import SendToPatient from './components/workflow/SendToPatient';
import PatientRegistration from './PatientRegistration';

const DoctorApp = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 min-h-screen">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        <Routes>
          {/* Redirect /clinic to /clinic/dashboard */}
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="manage-patients" element={<PatientDatabasePage />} />
          <Route path="manage-patient/:id" element={<PatientDetails />} />
          <Route path="manage-patient/:id/workflow" element={<PatientWorkflow />}>
            <Route index element={<Navigate to="information" replace />} />
            <Route path="information" element={<PatientInformation />} />
            <Route path="review" element={<ReviewAndFinalize />} />
            <Route path="send" element={<SendToPatient />} />
          </Route>
          <Route path="services" element={<ClinicServicesPage />} />
          <Route path="manage-patients/new" element={<PatientRegistration />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default DoctorApp;