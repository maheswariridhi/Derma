import React from 'react';
import ReportViewer from '../../components/patient/ReportViewer';
import PatientNavbar from './PatientNavbar';

const ReportPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PatientNavbar />
      <div className="container mx-auto py-6">
        <ReportViewer />
      </div>
    </div>
  );
};

export default ReportPage; 