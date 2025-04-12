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
    <div className="px-8 py-4">
      <div className="space-y-0 relative">
        {/* Vertical connecting line */}
        <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gray-200 z-0"></div>
        
        {steps.map((step, index) => (
          <div
            key={step.id}
            onClick={() => onStepClick(step.id)}
            className={`flex items-start p-4 cursor-pointer transition-colors relative z-10 mb-8
              ${activeStep === step.id ? 'opacity-100' : 'opacity-70 hover:opacity-90'}`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full mr-5 flex-shrink-0
                ${activeStep === step.id 
                  ? 'bg-teal-500 text-white' 
                  : activeStep > step.id
                    ? 'bg-gray-300 text-white'
                    : 'bg-gray-100 text-gray-500'}`}
            >
              {activeStep > step.id ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.id
              )}
            </div>
            <div>
              <div className={`font-medium text-lg mb-1 ${activeStep === step.id ? 'text-teal-600' : 'text-gray-900'}`}>
                {step.label}
              </div>
              <div className="text-sm text-gray-500">
                {step.description}
              </div>
              
              {/* Optional badge for active step */}
              {activeStep === step.id && (
                <div className="inline-block bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded mt-2 font-medium">
                  Current
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowSteps;
