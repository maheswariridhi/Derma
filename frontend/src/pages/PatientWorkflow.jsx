import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const WorkflowStep = ({ number, title, description, isActive }) => (
  <div className={`flex items-start gap-4 p-4 ${isActive ? 'bg-green-50 rounded-lg' : ''}`}>
    <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
      isActive ? 'bg-green-600 text-white' : 'border-2 border-gray-300 text-gray-500'
    }`}>
      {number}
    </div>
    <div>
      <h3 className={`font-medium ${isActive ? 'text-green-600' : 'text-gray-900'}`}>{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

const PatientWorkflow = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock patient data - replace with actual data fetching
  const patients = {
    1: {
      name: "Nancy Out of Network",
      phone: "(855) 369-8746",
      time: "11/18/2024"
    },
    2: {
      name: "Candi Copay",
      phone: "(245) 698-3265",
      time: "11/18/2024"
    },
    3: {
      name: "Allen Allowed",
      phone: "(253) 687-9654",
      time: "11/18/2024"
    },
    4: {
      name: "Marvin Medicaid",
      phone: "(585) 484-6245",
      time: "11/18/2024"
    }
  };

  const selectedPatient = patients[id];

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button 
        onClick={handleBack}
        className="text-gray-600 hover:text-gray-900 mb-4"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-8">Finalize Case</h1>

      <div className="space-y-4 mb-8">
        <WorkflowStep
          number="1"
          title="Tell us about the patient"
          description="We use this information to make a case presentation."
          isActive={true}
        />
        <WorkflowStep
          number="2"
          title="Review and Finalize"
          description="Click on any text in the treatment plan to edit it."
          isActive={false}
        />
        <WorkflowStep
          number="3"
          title="Send to Patient"
          description="Send the treatment plan for review"
          isActive={false}
        />
      </div>

      <button 
        className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 mb-8"
      >
        I'm finished reviewing
      </button>

      {selectedPatient && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold mb-4">Patient Information</h2>
          <div className="space-y-2">
            <p className="text-gray-700">Patient: {selectedPatient.name}</p>
            <p className="text-gray-700">Phone: {selectedPatient.phone}</p>
            <p className="text-gray-700">Appointment: {selectedPatient.time}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientWorkflow;