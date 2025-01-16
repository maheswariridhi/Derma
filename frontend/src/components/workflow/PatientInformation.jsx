import React, { useState } from 'react';

const PatientInformation = ({ patient, onComplete }) => {
  const [editedPatient, setEditedPatient] = useState(patient);

  const handleSubmit = () => {
    onComplete(editedPatient);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Patient Information</h2>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
            <input
              type="text"
              value={editedPatient.name}
              onChange={(e) => setEditedPatient({...editedPatient, name: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
            <input
              type="text"
              value={editedPatient.phone}
              onChange={(e) => setEditedPatient({...editedPatient, phone: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={editedPatient.email}
              onChange={(e) => setEditedPatient({...editedPatient, email: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Medical Information */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Condition</label>
            <input
              type="text"
              value={editedPatient.condition}
              onChange={(e) => setEditedPatient({...editedPatient, condition: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Last Visit</label>
            <input
              type="date"
              value={editedPatient.lastVisit}
              onChange={(e) => setEditedPatient({...editedPatient, lastVisit: e.target.value})}
              className="w-full p-2.5 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save and Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientInformation; 