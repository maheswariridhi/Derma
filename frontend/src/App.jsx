import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import AppointmentsPage from './pages/AppointmentsPage';
import PatientWorkflow from './pages/PatientWorkflow';
import PatientDatabasePage from './pages/PatientDatabasePage';
import PatientDetails from './pages/PatientDetails';
import ClinicServicesPage from './pages/ClinicServicesPage';
import MainLayout from './layouts/MainLayout';
import PatientInformation from './components/workflow/PatientInformation';
import ReviewAndFinalize from './components/workflow/ReviewAndFinalize';
import SendToPatient from './components/workflow/SendToPatient';
import PatientRegistration from './components/patients/PatientRegistration';

const App = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/patients" element={<PatientDatabasePage />} />
          <Route path="/patient/:id" element={<PatientDetails />} />
          <Route path="/patient/:id/workflow" element={<PatientWorkflow />}>
            <Route index element={<Navigate to="information" replace />} />
            <Route path="information" element={<PatientInformation />} />
            <Route path="review" element={<ReviewAndFinalize />} />
            <Route path="send" element={<SendToPatient />} />
          </Route>
          <Route path="/clinic-services" element={<ClinicServicesPage />} />
          <Route path="/patients/new" element={<PatientRegistration />} />
          <Route path="/review" element={<ReviewAndFinalize />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
};

export default App;