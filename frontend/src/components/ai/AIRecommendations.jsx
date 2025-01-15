import React, { useState, useEffect } from 'react';
import { getAIRecommendations } from '../../services/ai/aiService';
import RecommendationCard from './RecommendationCard';

const AIRecommendations = ({ patientData }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, [patientData]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const data = await getAIRecommendations(patientData);
      setRecommendations(data);
    } catch (err) {
      setError('Failed to load AI recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!recommendations) return null;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800">Next Appointment</h3>
        <p className="text-blue-600">{recommendations.next_appointment}</p>
      </div>

      <div className="space-y-4">
        {recommendations.recommendations.map((rec, index) => (
          <RecommendationCard key={index} recommendation={rec} />
        ))}
      </div>

      {recommendations.additional_notes && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold">Additional Notes</h3>
          <p className="text-gray-600">{recommendations.additional_notes}</p>
        </div>
      )}
    </div>
  );
};

const LoadingState = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="text-red-600">{message}</div>
  </div>
);

export default AIRecommendations; 