import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

export interface Patient {
  id: string;
  name: string;
  treatmentPlan?: any;
  status?: string;
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
  stepOptions: Step[];
}

const WorkflowSteps: React.FC<WorkflowStepsProps> = ({
  activeStep,
  onStepClick,
  patient,
  loading,
  stepRefs,
  stepOptions
}) => {
  const location = useLocation();
  const [isScrolling, setIsScrolling] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Determine the patient name for display
  const patientName = patient?.name || 'Patient';

  // Handle scroll synchronization
  const handleScroll = useCallback(() => {
    if (!contentRef.current || isScrolling) return;

    const { scrollTop, clientHeight } = contentRef.current;
    const step = Math.round(scrollTop / clientHeight) + 1;
    
    if (step >= 1 && step <= stepOptions.length) {
      onStepClick(step);
    }
  }, [isScrolling, onStepClick, stepOptions.length]);

  // Handle step click and smooth scroll
  const handleStepClick = useCallback((step: number) => {
    setIsScrolling(true);
    onStepClick(step);

    if (contentRef.current && stepRefs && stepRefs[step]) {
      const targetRef = stepRefs[step];
      if (targetRef.current) {
        targetRef.current.scrollIntoView({
          behavior: 'smooth'
        });
      }

      // Reset scrolling flag after animation
      setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    } else {
      setIsScrolling(false);
    }
  }, [onStepClick, stepRefs]);

  // If loading, show skeleton UI from PatientWorkflow
  if (loading) {
    return (
      <div className="flex h-full animate-fade-in">
        <div className="w-[280px] border-x border-gray-200 bg-white">
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900">Patient Workflow</h2>
        <p className="text-sm text-gray-500 mt-1">
          {patient ? patientName : 'Loading patient data...'}
        </p>
      </div>
      
      <nav aria-label="Workflow Steps">
        <ul className="space-y-1">
          {stepOptions.map((step) => {
            const isActive = activeStep === step.id;
            const isCompleted = activeStep > step.id;
            
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  className={`flex items-start w-full rounded-md p-3 text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : isCompleted
                      ? 'text-gray-500 hover:bg-gray-50'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={loading || (!isActive && !isCompleted)}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <div className="flex-shrink-0 flex h-6 items-center">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                          : isCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <svg
                          className="h-4 w-4"
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
                  <div className="ml-3 text-sm">
                    <div className="font-medium">{step.label}</div>
                    <p className={`mt-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step.description}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Help text */}
      <div className="mt-8 text-xs text-gray-500">
        <p>Click on a completed step to review it, or click on the current step to continue.</p>
        <p className="mt-2">Your progress is automatically saved at each step.</p>
      </div>
    </div>
  );
};

export default WorkflowSteps;
