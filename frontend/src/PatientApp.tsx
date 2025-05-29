import { Routes, Route, Navigate } from "react-router-dom";
import QueueView from "./pages/patient/QueueView";
import AppointmentBooking from "./pages/patient/AppointmentBooking";
import PatientProfile from "./pages/patient/PatientProfile";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientNavbar from "./pages/patient/PatientNavbar";
import ReportPage from "./pages/patient/ReportPage";
import PatientLogin from "./pages/patient/Login";
import PatientRegister from "./pages/patient/Register";
import PatientSettingsPage from "./pages/patient/SettingsPage";

const PatientApp: React.FC = () => {
  return (
    <Routes>
      <Route path="login" element={<PatientLogin />} />
      <Route path="register" element={<PatientRegister />} />
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gray-50">
            <PatientNavbar />
            <div className="container px-4 py-6 mx-auto">
              <Routes>
                <Route path="dashboard" element={<PatientDashboard />} />
                <Route path="queue/:tokenNumber?" element={<QueueView />} />
                <Route path="book" element={<AppointmentBooking />} />
                <Route path="settings" element={<PatientSettingsPage />} />
                <Route path="report/:reportId" element={<ReportPage />} />
                <Route path="*" element={<Navigate to="/patient/dashboard" replace />} />
              </Routes>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default PatientApp;
