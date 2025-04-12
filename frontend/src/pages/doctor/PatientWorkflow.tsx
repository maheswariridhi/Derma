'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Outlet } from 'react-router-dom';
import PatientService from '../../services/PatientService';
import WorkflowSteps from '../../components/workflow/WorkflowSteps';
import ReviewAndFinalize from '../../components/workflow/ReviewAndFinalize';
import { Card, Container, ThemeIcon } from '@mantine/core';
import { IconStethoscope, IconBrain } from '@tabler/icons-react'; 
import AIRecommendations from "../../components/ai/AIRecommendations";
import AIChatbot from "../../components/ai/AIChatbot";
import MedicationDropdown from "../../components/services/MedicationDropdown";
import TreatmentDropdown from "../../components/services/TreatmentDropdown";

interface Treatment {
  id: number;
  name: string;
  description: string;
  duration: string;
  cost: string;
}

interface Medicine {
  id: number;
  name: string;
  type: string;
  usage: string;
  dosage: string;
  stock: number;
}

interface Services {
  treatments: Treatment[];
  medicines: Medicine[];
}

interface TreatmentPlan {
  diagnosis: string;
  diagnosisDetails: string;
  medications: Array<{ name: string; dosage: string }>;
  nextSteps: string[];
  next_appointment: string;
  recommendations: any[];
  additional_notes: string;
  selectedTreatments?: Treatment[];
  selectedMedicines?: Medicine[];
}

interface Patient {
  id: string;
  name: string;
  phone?: string;
  treatmentPlan?: any; // We'll let ReviewAndFinalize handle the specific TreatmentPlan type
  status?: string;
}

const initialServices: Services = {
  treatments: [
    {
      id: 1,
      name: "Chemical Peel",
      description: "Exfoliating treatment to improve skin texture and tone",
      duration: "30-45 minutes",
      cost: "$150-300",
    },
    {
      id: 2,
      name: "Laser Hair Removal",
      description: "Permanent hair reduction using laser technology",
      duration: "15-60 minutes",
      cost: "$200-800",
    },
    {
      id: 3,
      name: "Acne Treatment",
      description: "Comprehensive treatment for active acne and scarring",
      duration: "45-60 minutes",
      cost: "$150-400",
    },
  ],
  medicines: [
    {
      id: 1,
      name: "Tretinoin",
      type: "Retinoid",
      usage: "Acne and anti-aging",
      dosage: "0.025%",
      stock: 75,
    },
    {
      id: 2,
      name: "Hyaluronic Acid",
      type: "Moisturizer",
      usage: "Hydration",
      dosage: "2%",
      stock: 80,
    },
    {
      id: 3,
      name: "Benzoyl Peroxide",
      type: "Antibacterial",
      usage: "Acne treatment",
      dosage: "5%",
      stock: 60,
    },
  ],
};

const useScrollManager = (contentRef: React.RefObject<HTMLDivElement>, setActiveStep: (step: number) => void) => {
  const [isScrolling, setIsScrolling] = React.useState(false);
  const scrollTimeout = React.useRef<NodeJS.Timeout>();

  const handleScroll = React.useCallback(() => {
    if (!contentRef.current || isScrolling) return;

    const { scrollTop, clientHeight } = contentRef.current;
    const step = Math.round(scrollTop / clientHeight) + 1;
    
    if (step >= 1 && step <= 3) {
      setActiveStep(step);
    }
  }, [isScrolling, setActiveStep]);

  const scrollToStep = React.useCallback((step: number) => {
    if (!contentRef.current) return;

    setIsScrolling(true);
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    contentRef.current.scrollTo({
      top: (step - 1) * contentRef.current.clientHeight,
      behavior: 'smooth'
    });

    // Reset scrolling flag after animation
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  }, []);

  React.useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  return { handleScroll, scrollToStep };
};

const PatientWorkflow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const contentRef = React.useRef<HTMLDivElement>(null);
  const stepRefs = {
    1: React.useRef<HTMLDivElement>(null),
    2: React.useRef<HTMLDivElement>(null),
    3: React.useRef<HTMLDivElement>(null),
  };
  const { handleScroll, scrollToStep } = useScrollManager(contentRef, setActiveStep);

  // Handle step click from sidebar
  const handleStepClick = (step: number) => {
    setActiveStep(step);
    scrollToStep(step);
  };

  useEffect(() => {
    const loadPatient = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = location.state?.patient || (id && await PatientService.getPatientById(id));
        if (!data) throw new Error('Patient not found');
        
        setPatient(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [id, location.state]);

  const handleStepComplete = async (updatedPatient: Patient) => {
    try {
      if (!id) throw new Error('Patient ID is required');
      
      await PatientService.updatePatientStatus(id, updatedPatient.status || 'active');
      setPatient(updatedPatient);
      const nextStep = Math.min(activeStep + 1, 3);
      setActiveStep(nextStep);
      scrollToStep(nextStep);
    } catch (error) {
      setError('Failed to update workflow.');
    }
  };

  const sendReportToPatient = async () => {
    try {
      if (!patient?.id || !patient.treatmentPlan) return;
      await PatientService.sendPatientReport({ patientId: patient.id, ...patient.treatmentPlan });
      navigate('/patient/dashboard');
    } catch (error) {
      setError("Failed to send report.");
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-800 font-medium mb-2">{error || 'Patient Not Found'}</p>
          <button 
            onClick={() => navigate('/clinic/dashboard')}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => (
    <div className="flex flex-col space-y-0">
      <section 
        ref={stepRefs[1]} 
        className="min-h-screen w-full flex items-center py-8 first:pt-0 last:pb-0"
      >
        <div className="w-full">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h1 className="text-2xl font-medium text-gray-800">Patient Information</h1>
            </div>
            <div className="p-6">
              <Outlet context={{ patient, onComplete: handleStepComplete, error, setError }} />
            </div>
          </div>
        </div>
      </section>

      <section 
        ref={stepRefs[2]} 
        className="min-h-screen w-full flex items-center py-8"
      >
        <div className="w-full">
          <ReviewAndFinalize 
            patient={patient} 
            onComplete={handleStepComplete}
          />
        </div>
      </section>

      <section 
        ref={stepRefs[3]} 
        className="min-h-screen w-full flex items-center py-8"
      >
        <div className="w-full">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Ready to Send</h3>
                <p className="text-blue-700">
                  Review the treatment plan for {patient.name} before sending.
                </p>
              </div>
              
              <button 
                className="w-full py-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-lg font-medium"
                onClick={sendReportToPatient}
              >
                Send Treatment Plan
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Workflow Steps Panel */}
      <div className="w-[280px] border-x border-gray-200 bg-white">
        <div className="border-b p-6">
          <div className="flex justify-center">
            <h2 className="text-xl font-semibold text-center">{patient?.name}</h2>
          </div>
        </div>
        
        <WorkflowSteps
          activeStep={activeStep}
          onStepClick={handleStepClick}
          steps={[
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
          ]}
        />
      </div>

      {/* Content Area */}
      <div 
        ref={contentRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-gray-50 scroll-smooth"
        style={{
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="container mx-auto px-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default PatientWorkflow;
