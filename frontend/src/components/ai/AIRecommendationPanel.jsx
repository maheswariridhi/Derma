import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AIRecommendationPanel = ({ patientId, patientData }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        let response;
        
        if (patientId) {
          response = await axios.post(`/api/ai/analyze/${patientId}`);
        } else if (patientData) {
          response = await axios.post('/api/ai/analyze', patientData);
        }
        
        setAnalysis(response.data);
      } catch (err) {
        setError('Failed to fetch AI analysis');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (patientId || patientData) {
      fetchAnalysis();
    }
  }, [patientId, patientData]);

  if (loading) return <div>Loading analysis...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!analysis) return null;

  return (
    <div className="space-y-6">
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-semibold text-lg mb-4 text-gray-800">AI Recommendations</h3>
        <div className="space-y-4">
          <div className="whitespace-pre-line bg-gray-50 p-4 rounded">
            {analysis.recommendations}
          </div>
          
          <div className="mt-4">
            <p><strong>Next Appointment:</strong> {analysis.next_appointment}</p>
          </div>

          <div className="mt-4">
            <strong>Confidence Score:</strong>
            <div className="flex items-center mt-1">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${analysis.confidence_score * 100}%` }}
                ></div>
              </div>
              <span className="ml-2">{Math.round(analysis.confidence_score * 100)}%</span>
            </div>
          </div>

          {analysis.medical_context && (
            <div className="mt-4">
              <strong>Medical Context:</strong>
              <p className="text-gray-700 mt-1">{analysis.medical_context}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AIRecommendationPanel;
