import React from 'react';

const PatientInformation = ({ patient }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Patient Information</h2>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="mt-1">{patient.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Phone</label>
            <p className="mt-1">{patient.phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="mt-1">{patient.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Appointment</label>
            <p className="mt-1">{patient.appointment}</p>
          </div>
          {patient.treatmentPlan && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-500">Diagnosis</label>
                <p className="mt-1">{patient.treatmentPlan.diagnosis}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Current Status</label>
                <p className="mt-1">{patient.treatmentPlan.currentStatus}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientInformation; 