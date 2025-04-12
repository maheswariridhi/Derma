import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider, createTheme, MantineThemeOverride } from "@mantine/core";
import "@mantine/core/styles.css";
import DoctorApp from "./DoctorApp";
import PatientApp from "./PatientApp";

// Define Mantine theme override
const theme: MantineThemeOverride = createTheme({
  /** Put your theme override here */
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/clinic" replace />} />
          <Route path="/clinic/*" element={<DoctorApp />} />
          <Route path="/patient/*" element={<PatientApp />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
}

export default App;
