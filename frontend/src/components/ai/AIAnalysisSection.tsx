import React from "react";
import AIRecommendationPanel from "./AIRecommendationPanel";
import AIRecommendations from "./AIRecommendations";

// Define AIResults interface
interface AIResults {
  diagnosis: string;
  treatment_plan: string | object;
}

// Define Props interface
interface AIAnalysisSectionProps {
  aiResults?: AIResults;
}

const AIAnalysisSection: React.FC<AIAnalysisSectionProps> = ({ aiResults }) => {
  if (!aiResults) return null;

  return (
    <section className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">AI Recommendations</h2>
      <div className="space-y-6">
        <AIRecommendationPanel diagnosisData={aiResults.diagnosis} />
        <AIRecommendations treatmentData={aiResults.treatment_plan} />
      </div>
    </section>
  );
};

export default AIAnalysisSection;
