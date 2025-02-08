import React from "react";

// Define Recommendation interface
interface Recommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  suggestedDate?: string;
  reasoning: string;
}

// Define Props interface
interface RecommendationCardProps {
  recommendation: Recommendation;
  onAccept: (recommendation: Recommendation) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onAccept,
}) => {
  const getPriorityColor = (priority: "high" | "medium" | "low"): string => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{recommendation.title}</h3>
        <span
          className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
            recommendation.priority
          )}`}
        >
          {recommendation.priority.toUpperCase()}
        </span>
      </div>
      <p className="text-gray-600 mb-2">{recommendation.description}</p>
      {recommendation.suggestedDate && (
        <div className="text-sm text-gray-500">
          Suggested Date: {recommendation.suggestedDate}
        </div>
      )}
      <div className="mt-2 text-sm text-gray-500">
        <p>
          <strong>Reasoning:</strong> {recommendation.reasoning}
        </p>
      </div>
      <div className="mt-3">
        <button
          onClick={() => onAccept(recommendation)}
          className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full hover:bg-green-100"
        >
          Accept Recommendation
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;
