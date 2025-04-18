import { Routes, Route, Navigate } from "react-router-dom";
import QueueView from "./pages/patient/QueueView";
import AppointmentBooking from "./pages/patient/AppointmentBooking";
import PatientProfile from "./pages/patient/PatientProfile";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientNavbar from "./pages/patient/PatientNavbar";
import ReportPage from "./pages/patient/ReportPage";

const PatientApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />
      <div className="container px-4 py-6 mx-auto">
        <Routes>
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="queue/:tokenNumber?" element={<QueueView />} />
          <Route path="book" element={<AppointmentBooking />} />
          <Route path="profile" element={<PatientProfile />} />
          <Route path="report/:reportId" element={<ReportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default PatientApp;
