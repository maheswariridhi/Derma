import React from "react";
import { useLocation } from "react-router-dom";

export interface Patient {
  id: string;
  name: string;
  treatmentPlan?: any;
  status?: string;
  phone?: string;
}

// Define Step interface
export interface Step {
  id: number;
  label: string;
  description: string;
  component: React.ComponentType<any>;
}

// Define Props interface
export interface WorkflowStepsProps {
  activeStep: number;
  onStepClick: (step: number) => void;
  patient: Patient | null;
  loading: boolean;
  stepRefs?: Record<number, React.RefObject<HTMLDivElement>>;
  stepOptions?: Step[];
}

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
);

const WorkflowSteps: React.FC<WorkflowStepsProps> = ({
  activeStep,
  onStepClick,
  patient,
  loading,
  stepRefs
}) => {
  const location = useLocation();
  
  // Define default step options if not provided
  const stepOptions = [
    { 
      id: 1, 
      label: "Patient Information", 
      description: "Enter patient details and medical history",
      component: null 
    },
    { 
      id: 2, 
      label: "Review & Finalize", 
      description: "Confirm treatment plan and medications",
      component: null 
    },
    { 
      id: 3, 
      label: "Send to Patient", 
      description: "Confirm contact method and send report",
      component: null 
    },
  ];

  // Updated step definitions to match the screenshots
  const updatedStepOptions = [
    {
      id: 1,
      label: "Tell us about the patient",
      description: "Basic patient details",
      status: activeStep === 1 ? "Current" : "",
      icon: "👤"
    },
    {
      id: 2,
      label: "Review and Finalize",
      description: "Review treatment plan to edit it and send it to the patient",
      status: "",
      icon: "📋"
    },
    {
      id: 3,
      label: "Send to Patient",
      description: "Send the completed treatment plan to patient",
      status: "",
      icon: "📩"
    }
  ];

  // If loading, show skeleton UI
  if (loading) {
    return (
      <div className="flex h-full">
        <div className="w-[280px] border-x border-gray-200 bg-white p-6">
          <LoadingSkeleton />
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            <LoadingSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      {/* Patient name centered and larger */}
      <div className="mb-8 text-center">
        <h2 className="text-xl font-medium text-gray-800">
          {patient?.name || 'Patient'}
        </h2>
      </div>
      
      <nav aria-label="Workflow Steps">
        <ul className="space-y-6">
          {updatedStepOptions.map((step) => {
            const isActive = activeStep === step.id;
            const isCompleted = activeStep > step.id;
            
            return (
              <li key={step.id} className="relative">
                {isActive && (
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-teal-500 rounded-r"></div>
                )}
                <div className={`${isActive ? 'pl-4' : 'pl-0'} transition-all duration-200`}>
                  <button
                    type="button"
                    onClick={() => onStepClick(step.id)}
                    className={`flex items-start w-full text-left transition-colors ${
                      isActive ? 'text-teal-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                    }`}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center mr-3">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          isActive
                            ? 'bg-teal-100 text-teal-600'
                            : isCompleted
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {isCompleted ? (
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <span>{step.id}</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-base">{step.label}</div>
                      <p className={`mt-1 text-sm ${isActive ? 'text-teal-500' : 'text-gray-500'}`}>
                        {step.description}
                      </p>
                      {step.status && (
                        <div className="mt-1 text-xs text-teal-500 font-medium">
                          {step.status}
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default WorkflowSteps;
