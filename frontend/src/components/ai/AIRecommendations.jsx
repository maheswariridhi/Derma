import React from 'react';
import RecommendationCard from './RecommendationCard';

const AIRecommendations = ({ treatmentData }) => {
  if (!treatmentData) return null;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800">Next Appointment</h3>
        <p className="text-blue-600">{treatmentData.next_appointment}</p>
      </div>

      <div className="space-y-4">
        {treatmentData.recommendations.map((rec, index) => (
          <RecommendationCard key={index} recommendation={rec} />
        ))}
      </div>

      {treatmentData.additional_notes && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold">Additional Notes</h3>
          <p className="text-gray-600">{treatmentData.additional_notes}</p>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations; 