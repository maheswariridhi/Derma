import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const WorkflowSteps = ({ steps, activeStep, onStepClick }) => {
  const location = useLocation();
  const patientId = location.pathname.split('/')[3]; // Updated to get ID from /clinic/manage-patient/:id/...

  return (
    <div className="p-6">
      <div className="space-y-4">
        {steps.map((step) => (
          <Link
            key={step.id}
            to={`/clinic/manage-patient/${patientId}/workflow/${step.id === 1 ? 'information' : step.id === 2 ? 'review' : 'send'}`}
            className={`block p-4 rounded-lg border ${
              activeStep === step.id
                ? 'bg-blue-50 border-blue-500'
                : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onStepClick(step.id)}
          >
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeStep === step.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}>
                {step.id}
              </div>
              <span className="ml-3 font-medium">{step.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WorkflowSteps; 