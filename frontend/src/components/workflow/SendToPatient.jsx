import React, { useState } from 'react';

const SendToPatient = ({ patient, onComplete }) => {
  const [communicationMethod, setCommunicationMethod] = useState('email');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleSubmit = () => {
    onComplete({
      ...patient,
      communicationPreference: {
        method: communicationMethod,
        notes: additionalNotes
      },
      status: 'Sent'
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Send to Patient</h2>
      
      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        {/* Communication Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Communication Method
          </label>
          <div className="space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="email"
                checked={communicationMethod === 'email'}
                onChange={(e) => setCommunicationMethod(e.target.value)}
                className="form-radio"
              />
              <span className="ml-2">Email</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="sms"
                checked={communicationMethod === 'sms'}
                onChange={(e) => setCommunicationMethod(e.target.value)}
                className="form-radio"
              />
              <span className="ml-2">SMS</span>
            </label>
          </div>
        </div>

        {/* Patient Contact Info */}
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-medium mb-2">Patient Contact Information</h3>
          <p>Email: {patient.email}</p>
          <p>Phone: {patient.phone}</p>
        </div>

        {/* Treatment Plan Summary */}
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-medium mb-2">Treatment Plan Summary</h3>
          <p>Diagnosis: {patient.treatmentPlan?.diagnosis}</p>
          <p>Status: {patient.treatmentPlan?.currentStatus}</p>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="w-full p-2 border rounded h-32"
            placeholder="Add any additional notes for the patient..."
          />
        </div>

        {/* Confirmation */}
        <div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="form-checkbox"
            />
            <span className="ml-2">
              I confirm that all information is correct and ready to be sent to the patient
            </span>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isConfirmed}
          className={`w-full py-2 rounded ${
            isConfirmed 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Send to Patient
        </button>
      </div>
    </div>
  );
};

export default SendToPatient; 