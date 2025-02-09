import React from "react";
import { Link, useLocation } from "react-router-dom";

// Define Step interface
interface Step {
  id: number;
  label: string;
  description: string;
}

// Define Props interface
interface WorkflowStepsProps {
  steps: Step[];
  activeStep: number;
  onStepClick: (stepId: number) => void;
}

const WorkflowSteps: React.FC<WorkflowStepsProps> = ({
  steps,
  activeStep,
  onStepClick,
}) => {
  const location = useLocation();
  const patientId = location.pathname.split("/")[3] || "";

  return (
    <div className="space-y-2">
      {steps.map((step) => (
        <div
          key={step.id}
          onClick={() => onStepClick(step.id)}
          className={`flex items-center p-4 cursor-pointer rounded-lg transition-colors
            ${activeStep === step.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
        >
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 
              ${activeStep === step.id 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-500'}`}
          >
            {step.id}
          </div>
          <div>
            <div className={`font-medium ${activeStep === step.id ? 'text-blue-600' : 'text-gray-900'}`}>
              {step.label}
            </div>
            <div className="text-sm text-gray-500">
              {step.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkflowSteps;
