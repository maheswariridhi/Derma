import React from 'react';

const WorkflowSteps = ({ activeStep, onStepClick, steps }) => {
  return (
    <div className="p-6">
      <div className="space-y-4">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => onStepClick(step.id)}
            className={`w-full text-left p-4 rounded-lg transition-colors ${
              activeStep === step.id
                ? 'bg-blue-50 text-blue-700'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                activeStep === step.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100'
              }`}>
                {step.id}
              </div>
              {step.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WorkflowSteps; 