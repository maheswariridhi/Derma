import React, { useState } from 'react';
import AIRecommendationPanel from '../ai/AIRecommendationPanel';

const ReviewAndFinalize = ({ patient, onComplete }) => {
  const [treatmentPlan, setTreatmentPlan] = useState({
    diagnosis: patient?.treatmentPlan?.diagnosis || '',
    currentStatus: patient?.treatmentPlan?.currentStatus || '',
    medications: patient?.treatmentPlan?.medications || [],
    nextSteps: patient?.treatmentPlan?.nextSteps || [],
  });

  const [activeSection, setActiveSection] = useState('diagnosis');
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '' });
  const [newStep, setNewStep] = useState('');

  const handleAddMedication = () => {
    if (newMedication.name && newMedication.dosage) {
      setTreatmentPlan((prev) => ({
        ...prev,
        medications: [...prev.medications, newMedication],
      }));
      setNewMedication({ name: '', dosage: '' });
    }
  };

  const handleAddStep = () => {
    if (newStep) {
      setTreatmentPlan((prev) => ({
        ...prev,
        nextSteps: [...prev.nextSteps, newStep],
      }));
      setNewStep('');
    }
  };

  const handleSaveAndContinue = () => {
    if (onComplete) {
      onComplete({ ...patient, treatmentPlan });
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Panel - Navigation */}
      <div className="w-72 border-r border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Treatment Review</h2>
        <nav className="space-y-2">
          {['diagnosis', 'medications', 'next-steps', 'ai-recommendations'].map((section, index) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                activeSection === section ? 'bg-white shadow-sm border border-gray-200' : 'hover:bg-white/50'
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                {index + 1}
              </span>
              <span className="text-gray-700 capitalize">{section.replace('-', ' ')}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={handleSaveAndContinue}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save and Continue
        </button>
      </div>

      {/* Right Panel - Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {activeSection === 'diagnosis' && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Diagnosis & Status</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Diagnosis</label>
                  <input
                    type="text"
                    value={treatmentPlan.diagnosis}
                    onChange={(e) =>
                      setTreatmentPlan({ ...treatmentPlan, diagnosis: e.target.value })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Current Status</label>
                  <input
                    type="text"
                    value={treatmentPlan.currentStatus}
                    onChange={(e) =>
                      setTreatmentPlan({ ...treatmentPlan, currentStatus: e.target.value })
                    }
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </section>
          )}

          {activeSection === 'medications' && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Medications</h3>
              <div className="space-y-4">
                {treatmentPlan.medications.map((med, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-700">{med.name}</span>
                    <span className="text-gray-600">{med.dosage}</span>
                  </div>
                ))}
                <div className="flex gap-3">
                  <input
                    placeholder="Medication name"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                    className="flex-1 p-2.5 border border-gray-300 rounded-lg"
                  />
                  <input
                    placeholder="Dosage"
                    value={newMedication.dosage}
                    onChange={(e) =>
                      setNewMedication({ ...newMedication, dosage: e.target.value })
                    }
                    className="flex-1 p-2.5 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={handleAddMedication}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'next-steps' && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Next Steps</h3>
              <div className="space-y-4">
                {treatmentPlan.nextSteps.map((step, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
                <div className="flex gap-3">
                  <input
                    placeholder="Add next step"
                    value={newStep}
                    onChange={(e) => setNewStep(e.target.value)}
                    className="flex-1 p-2.5 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={handleAddStep}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'ai-recommendations' && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Recommendations</h3>
              <AIRecommendationPanel patientId={patientData?.id} patientData={patientData} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewAndFinalize;
