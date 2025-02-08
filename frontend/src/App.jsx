import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MantineProvider, createTheme } from "@mantine/core";
import '@mantine/core/styles.css';
import DoctorApp from "./DoctorApp";
import PatientApp from "./PatientApp";

const theme = createTheme({
  /** Put your theme override here */
});

const App = () => {
  return (
    <MantineProvider theme={theme}>
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
