'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Outlet } from 'react-router-dom';
import PatientService from '../../services/PatientService';
import WorkflowSteps from '../../components/workflow/WorkflowSteps';
import ReviewAndFinalize from '../../components/workflow/ReviewAndFinalize';

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

const PatientWorkflow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(location.state?.patient || null);
  const [loading, setLoading] = useState(!location.state?.patient);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const contentRef = React.useRef<HTMLDivElement>(null);
  const stepRefs = {
    1: React.useRef<HTMLDivElement>(null),
    2: React.useRef<HTMLDivElement>(null),
    3: React.useRef<HTMLDivElement>(null),
  };

  // Handle scroll synchronization
  const handleScroll = React.useCallback(() => {
    if (!contentRef.current || isScrolling) return;

    const { scrollTop, clientHeight } = contentRef.current;
    const step = Math.round(scrollTop / clientHeight) + 1;
    
    if (step >= 1 && step <= 3) {
      setActiveStep(step);
    }
  }, [isScrolling]);

  // Handle step click and smooth scroll
  const handleStepClick = React.useCallback((step: number) => {
    setIsScrolling(true);
    setActiveStep(step);

    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: (step - 1) * contentRef.current.clientHeight,
        behavior: 'smooth'
      });

      // Reset scrolling flag after animation
      setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    const loadPatientDetails = async () => {
      if (!id || (patient?.treatmentPlan && !loading)) {
        setLoadingDetails(false);
        return;
      }

      try {
        setLoadingDetails(true);
        setError(null);

        const data = await PatientService.getPatientById(id);
        if (!data) throw new Error('Patient not found');
        
        setPatient(prevPatient => ({
          ...prevPatient,
          ...data,
        }));
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoadingDetails(false);
        setLoading(false);
      }
    };

    loadPatientDetails();
  }, [id, patient?.treatmentPlan, loading]);

  const handleStepComplete = async (updatedPatient: Patient) => {
    try {
      if (!id) throw new Error('Patient ID is required');
      
      await PatientService.updatePatientStatus(id, updatedPatient.status || 'active');
      setPatient(updatedPatient);
      const nextStep = Math.min(activeStep + 1, 3);
      setActiveStep(nextStep);
      handleStepClick(nextStep);
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
      <div className="flex h-full">
        <div className="w-[280px] border-x border-gray-200 bg-white">
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
    <div className="flex h-full">
      <div className="w-[280px] border-x border-gray-200 bg-white">
        <WorkflowSteps
          activeStep={activeStep}
          onStepClick={handleStepClick}
          patient={patient}
          loading={loadingDetails}
          stepRefs={stepRefs}
        />
      </div>
      <div 
        ref={contentRef} 
        className="flex-1 overflow-y-auto bg-gray-50 scroll-smooth"
        onScroll={handleScroll}
      >
        <div className="max-w-4xl mx-auto p-8">
          <div className="space-y-0">
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
                    <Outlet context={{ 
                      patient,
                      loading: loadingDetails,
                      onStepComplete: handleStepComplete,
                      onFinish: sendReportToPatient,
                      stepRefs,
                      services: initialServices
                    }} />
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
                        Review the treatment plan for {patient?.name} before sending.
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
        </div>
      </div>
    </div>
  );
};

export default PatientWorkflow;
