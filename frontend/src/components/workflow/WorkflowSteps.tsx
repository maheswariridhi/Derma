import React from "react";
import { Link, useLocation } from "react-router-dom";

interface Patient {
  id: string;
  name: string;
  status?: string;
}

// Define Step interface
interface Step {
  id: number;
  label: string;
  description: string;
  completed?: boolean;
}

// Define Props interface
interface WorkflowStepsProps {
  activeStep: number;
  onStepClick: (stepId: number) => void;
  patient: Patient | null;
  loading?: boolean;
  onScroll?: () => void;
  stepRefs?: {
    [key: number]: React.RefObject<HTMLDivElement>;
  };
}

const defaultSteps: Step[] = [
  { 
    id: 1, 
    label: 'Patient Details',
    description: 'Basic information'
  },
  { 
    id: 2, 
    label: 'Treatment Plan',
    description: 'Review and edit plan'
  },
  { 
    id: 3, 
    label: 'Send to Patient',
    description: 'Finalize and send'
  },
];

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const WorkflowSteps: React.FC<WorkflowStepsProps> = ({
  activeStep,
  onStepClick,
  patient,
  loading = false,
  onScroll,
  stepRefs
}) => {
  const location = useLocation();
  const steps = defaultSteps.map(step => ({
    ...step,
    completed: step.id < activeStep
  }));

  const handleStepClick = (step: number) => {
    onStepClick(step);
    if (stepRefs?.[step]?.current) {
      stepRefs[step].current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (loading && !patient) {
    return (
      <div className="p-8">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-8 py-6">
        <div className="flex justify-center">
          <h2 className="text-xl font-semibold text-center">
            {loading ? (
              <div className="animate-pulse h-6 bg-gray-200 rounded w-32"></div>
            ) : (
              patient?.name || 'Patient'
            )}
          </h2>
        </div>
      </div>

      <div className="px-8 py-6 flex-1">
        <div className="space-y-8 relative">
          {/* Vertical connecting line */}
          <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200 z-0"></div>
          
          {steps.map((step) => (
            <div
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className={`flex items-start relative z-10 group cursor-pointer
                ${loading ? 'opacity-50 pointer-events-none' : ''}
                ${activeStep === step.id ? 'opacity-100' : 'opacity-70 hover:opacity-90'}`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full mr-4 flex-shrink-0 transition-colors
                  ${step.completed 
                    ? 'bg-teal-500 text-white'
                    : activeStep === step.id
                      ? 'bg-teal-500 text-white' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}
              >
                {step.completed ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className="min-h-[4rem]">
                <div className={`font-medium text-lg mb-2
                  ${activeStep === step.id ? 'text-teal-600' : 'text-gray-900'}
                  ${loading ? 'text-gray-400' : ''}`}
                >
                  {step.label}
                </div>
                <div className={`text-sm ${loading ? 'text-gray-400' : 'text-gray-500'}`}>
                  {step.description}
                </div>
                
                {/* Optional badge for active step */}
                {activeStep === step.id && !loading && (
                  <div className="inline-block bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded mt-3 font-medium">
                    Current
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowSteps;
