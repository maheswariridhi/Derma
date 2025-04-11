import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import DashboardPage from "./pages/doctor/DashboardPage";
import AppointmentsPage from "./pages/doctor/AppointmentsPage";
import PatientWorkflow from "./pages/doctor/PatientWorkflow";
import PatientDatabasePage from "./pages/doctor/PatientDatabasePage";
import PatientDetails from "./pages/doctor/PatientDetails";
import ClinicServicesPage from "./pages/doctor/ClinicServicesPage";
import ReportPage from "./pages/doctor/ReportPage";
import PatientInformation from "./components/workflow/PatientInformation";
import ReviewAndFinalize from "./components/workflow/ReviewAndFinalize";
import SendToPatient from "./components/workflow/SendToPatient";
import PatientRegistration from "./PatientRegistration";
import MainLayout from "./layouts/MainLayout";

const DoctorApp: React.FC = () => {
  const location = useLocation();
  const isWorkflowRoute = location.pathname.includes('/workflow');

  return (
    <MainLayout showWorkflow={isWorkflowRoute}>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="manage-patients" element={<PatientDatabasePage />} />
        <Route path="manage-patient/:id" element={<PatientDetails />} />
        <Route path="reports/:reportId" element={<ReportPage />} />
        <Route path="manage-patient/:id/workflow/*" element={<PatientWorkflow />}>
          <Route index element={<Navigate to="information" replace />} />
          <Route path="information" element={<PatientInformation />} />
          <Route path="review" element={<ReviewAndFinalize />} />
          <Route path="send" element={<SendToPatient />} />
        </Route>
        <Route path="services" element={<ClinicServicesPage />} />
        <Route path="manage-patients/new" element={<PatientRegistration />} />
        {/* Catch all redirect to dashboard */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
};

export default DoctorApp;
