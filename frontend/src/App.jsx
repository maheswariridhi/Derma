import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MantineProvider } from "@mantine/core"; // Ensure MantineProvider is imported
import DoctorApp from "./DoctorApp";
import PatientApp from "./PatientApp";

const App = () => {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <BrowserRouter>
        <Routes>
          {/* Doctor/Clinic Routes */}
          <Route path="/clinic/*" element={<DoctorApp />} />

          {/* Patient Routes */}
          <Route path="/patient/*" element={<PatientApp />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/patient" replace />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
};

export default App;
