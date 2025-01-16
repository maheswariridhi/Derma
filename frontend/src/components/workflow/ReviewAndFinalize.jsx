import React, { useState } from 'react';

const ReviewAndFinalize = ({ patient, onComplete }) => {
  const [treatmentPlan, setTreatmentPlan] = useState({
    diagnosis: patient.treatmentPlan?.diagnosis || '',
    currentStatus: patient.treatmentPlan?.currentStatus || '',
    medications: patient.treatmentPlan?.medications || [],
    nextSteps: patient.treatmentPlan?.nextSteps || []
  });

  const [newMedication, setNewMedication] = useState({ name: '', dosage: '' });
  const [newStep, setNewStep] = useState('');

  const handleAddMedication = () => {
    if (newMedication.name && newMedication.dosage) {
      setTreatmentPlan({
        ...treatmentPlan,
        medications: [...treatmentPlan.medications, newMedication]
      });
      setNewMedication({ name: '', dosage: '' });
    }
  };

  const handleAddStep = () => {
    if (newStep) {
      setTreatmentPlan({
        ...treatmentPlan,
        nextSteps: [...treatmentPlan.nextSteps, newStep]
      });
      setNewStep('');
    }
  };

  const handleSubmit = () => {
    onComplete({
      ...patient,
      treatmentPlan
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review & Finalize Treatment Plan</h2>
      
      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        {/* Diagnosis */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
          <input
            type="text"
            value={treatmentPlan.diagnosis}
            onChange={(e) => setTreatmentPlan({...treatmentPlan, diagnosis: e.target.value})}
            className="mt-1 w-full p-2 border rounded"
          />
        </div>

        {/* Current Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Status</label>
          <input
            type="text"
            value={treatmentPlan.currentStatus}
            onChange={(e) => setTreatmentPlan({...treatmentPlan, currentStatus: e.target.value})}
            className="mt-1 w-full p-2 border rounded"
          />
        </div>

        {/* Medications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Medications</label>
          <div className="space-y-2">
            {treatmentPlan.medications.map((med, index) => (
              <div key={index} className="flex justify-between bg-gray-50 p-2 rounded">
                <span>{med.name}</span>
                <span className="text-gray-600">{med.dosage}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              placeholder="Medication name"
              value={newMedication.name}
              onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
              className="flex-1 p-2 border rounded"
            />
            <input
              placeholder="Dosage"
              value={newMedication.dosage}
              onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleAddMedication}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </div>

        {/* Next Steps */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Next Steps</label>
          <ul className="list-disc list-inside space-y-1">
            {treatmentPlan.nextSteps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
          <div className="mt-2 flex gap-2">
            <input
              placeholder="Add next step"
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleAddStep}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ReviewAndFinalize; 