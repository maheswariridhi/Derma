import React from 'react';

export const AIRecommendationPanel = ({ patientData }) => {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800">AI Recommendations</h3>
        <p className="text-blue-700 mt-2">
          Loading recommendations for {patientData.name}...
        </p>
      </div>
    </div>
  );
};

export default AIRecommendationPanel; 