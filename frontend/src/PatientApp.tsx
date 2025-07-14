import { Routes, Route, Navigate } from "react-router-dom";
import AppointmentBooking from "./pages/patient/AppointmentBooking";
import PatientProfile from "./pages/patient/PatientProfile";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientNavbar from "./pages/patient/PatientNavbar";
import ReportListPage from "./pages/patient/ReportListPage";
import PatientSettingsPage from "./pages/patient/SettingsPage";
import Register from "./pages/patient/Register";

const PatientApp: React.FC = () => {
  return (
    <Routes>
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gray-50">
            <PatientNavbar />
            <div className="container px-4 py-6 mx-auto">
              <Routes>
                <Route path="dashboard" element={<PatientDashboard />} />
                <Route path="book" element={<AppointmentBooking />} />
                <Route path="settings" element={<PatientSettingsPage />} />
                <Route path="reports" element={<ReportListPage />} />
                <Route path="register" element={<Register />} />
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
