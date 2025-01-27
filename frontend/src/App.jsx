import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DoctorApp from "./DoctorApp";
import PatientApp from "./PatientApp";

const App = () => {
  return (
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
  );
};

export default App;