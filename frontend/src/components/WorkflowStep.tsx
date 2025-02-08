import React from "react";

// Define Props interface
interface WorkflowStepProps {
  number: number;
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({
  number,
  title,
  description,
  isActive,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`flex items-start gap-4 p-4 cursor-pointer ${
      isActive ? "bg-green-50 rounded-lg" : ""
    }`}
  >
    <div
      className={`flex items-center justify-center w-8 h-8 rounded-full ${
        isActive
          ? "bg-green-600 text-white"
          : "border-2 border-gray-300 text-gray-500"
      }`}
    >
      {number}
    </div>
    <div>
      <h3 className={`font-medium ${isActive ? "text-green-600" : "text-gray-900"}`}>
        {title}
      </h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  </div>
);

export default WorkflowStep;
