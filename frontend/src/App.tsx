import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DoctorApp from "./DoctorApp";
import PatientApp from "./PatientApp";
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/clinic" replace />} />
        <Route path="/clinic/*" element={<DoctorApp />} />
        <Route path="/patient/*" element={<PatientApp />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;
