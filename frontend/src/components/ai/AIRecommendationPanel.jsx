import React, { useState, useEffect } from 'react';
import { getAIRecommendations } from '../../services/ai/aiService';

const AIRecommendationPanel = ({ patientData }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (patientData) {
      fetchRecommendations();
    }
  }, [patientData]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await getAIRecommendations(patientData);
      setRecommendations(response);
      setError(null);
    } catch (err) {
      setError('Failed to load AI recommendations');
      console.error('AI Recommendation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  if (!recommendations) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">AI Recommendations</h2>
      
      {/* Next Appointment */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800">Next Appointment</h3>
        <p className="text-blue-600">{recommendations.next_appointment}</p>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.recommendations.map((rec, index) => (
          <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
            <h4 className="font-semibold text-gray-800">{rec.title}</h4>
            <p className="text-gray-600">{rec.description}</p>
            <div className="mt-2 flex gap-4">
              <span className={`px-2 py-1 rounded text-sm ${
                rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {rec.priority} priority
              </span>
              <span className="text-gray-500 text-sm">
                Suggested date: {rec.suggested_date}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Notes */}
      {recommendations.additional_notes && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold">Additional Notes</h3>
          <p className="text-gray-600">{recommendations.additional_notes}</p>
        </div>
      )}
    </div>
  );
};

export default AIRecommendationPanel; 