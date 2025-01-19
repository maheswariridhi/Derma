import React from 'react';

const AIRecommendationPanel = ({ patientData }) => {
  // Mock AI data or fallback in case patientData is not provided
  const mockAIData = {
    primaryDiagnosis: 'Type 2 Diabetes',
    confidence: 85,
    differentialDiagnoses: ['Metabolic Syndrome', 'Pre-diabetes', 'Insulin Resistance'],
    reasoning: 'Based on reported symptoms, medical history, and recent test results.',
  };

  const aiData = patientData?.aiRecommendations || mockAIData;

  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-semibold text-lg mb-4 text-gray-800">AI Diagnosis</h3>
        <div className="space-y-4">
          <p>
            <strong>Primary Diagnosis:</strong> {aiData.primaryDiagnosis}
          </p>
          <p>
            <strong>Confidence:</strong> {aiData.confidence}%
          </p>
          <div>
            <strong>Differential Diagnoses:</strong>
            <ul className="list-disc pl-5 mt-2 text-gray-700">
              {aiData.differentialDiagnoses.map((diagnosis, index) => (
                <li key={index}>{diagnosis}</li>
              ))}
            </ul>
          </div>
          <p>
            <strong>Reasoning:</strong> {aiData.reasoning}
          </p>
        </div>
      </section>
    </div>
  );
};

export default AIRecommendationPanel;
