'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import PatientService from '../../services/PatientService';
import WorkflowSteps from '../../components/workflow/WorkflowSteps';
import PatientInformation from '../../components/workflow/PatientInformation';
import ReviewAndFinalize from '../../components/workflow/ReviewAndFinalize';
import SendToPatient from '../../components/workflow/SendToPatient';

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

const PatientWorkflow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Simplified state management
  const [patient, setPatient] = useState<Patient | null>(location.state?.patient || null);
  const [loading, setLoading] = useState(true); // Always start with loading true
  const [activeStep, setActiveStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [useDemoData, setUseDemoData] = useState(false);

  const contentRef = React.useRef<HTMLDivElement>(null);
  const stepRefs = {
    1: React.useRef<HTMLDivElement>(null),
    2: React.useRef<HTMLDivElement>(null),
    3: React.useRef<HTMLDivElement>(null),
  };

  // Demo patient data
  const demoPatient: Patient = {
    id: "demo-123",
    name: "Demo Patient",
    phone: "555-123-4567",
    status: "active",
    treatmentPlan: {
      diagnosis: "Sample Diagnosis",
      diagnosisDetails: "Details of the sample diagnosis would go here",
      medications: [{ name: "Demo Medicine", dosage: "10mg" }],
      nextSteps: ["Follow-up in 2 weeks", "Apply treatment daily"],
      next_appointment: "2023-12-15",
      recommendations: [],
      additional_notes: "Sample notes for demonstration"
    }
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
    let mounted = true;
    
    const loadPatientDetails = async () => {
      // If we already have patient data from navigation state, just finish loading
      if (patient && location.state?.patient) {
        setLoading(false);
        localStorage.removeItem('patientWorkflowLoading');
        return;
      }

      try {
        // Try to get patient data from API
        if (id) {
          try {
            const data = await PatientService.getPatientById(id);
            
            if (data && mounted) {
              setPatient(prevPatient => ({
                ...prevPatient,
                ...data,
              }));
              setUseDemoData(false);
            } else if (mounted) {
              // If no data but API didn't throw, use demo data
              setPatient(demoPatient);
              setUseDemoData(true);
              toast.warning('Using demo data - backend may not be running');
            }
          } catch (apiError) {
            // API error - use demo data
            if (mounted) {
              setPatient(demoPatient);
              setUseDemoData(true);
              toast.warning('Using demo data - backend may not be running');
            }
          }
        } else if (mounted) {
          // No ID provided
          setError('Missing patient ID');
        }
      } catch (error) {
        if (mounted) {
          setError((error as Error).message || 'Failed to load patient details');
          toast.error('Failed to load patient details. Please try again.');
        }
      } finally {
        // Add slight delay before removing loading state to prevent flickering
        if (mounted) {
          setTimeout(() => {
            setLoading(false);
          }, 300);
        }
      }
    };

    loadPatientDetails();
    
    return () => {
      mounted = false; // Cleanup to prevent state updates after unmount
      localStorage.removeItem('patientWorkflowLoading'); // Ensure flag is cleared on unmount
    };
  }, [id, location.state]);

  // Add transition effect when component mounts
  useEffect(() => {
    // Remove body scroll during transition
    document.body.style.overflow = loading ? 'hidden' : '';
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [loading]);

  const handleStepComplete = async (updatedPatient: Patient) => {
    try {
      if (!id) {
        console.error('Cannot update patient: ID is missing');
        setError('Missing patient ID');
        return;
      }
      
      await PatientService.updatePatient(id, updatedPatient);
      setPatient(updatedPatient);
      const nextStep = Math.min(activeStep + 1, 3);
      setActiveStep(nextStep);
      handleStepClick(nextStep);
      toast.success('Progress saved successfully');
    } catch (error) {
      console.error('Error saving progress:', error);
      setError('Failed to update workflow.');
      toast.error('Failed to save progress. Please try again.');
    }
  };

  const sendReportToPatient = async () => {
    try {
      if (!patient?.id || !patient.treatmentPlan) return;
      await PatientService.sendPatientReport({ patientId: patient.id, ...patient.treatmentPlan });
      navigate('/clinic/dashboard');
      toast.success('Treatment plan sent to patient');
    } catch (error) {
      setError("Failed to send report.");
      toast.error('Failed to send treatment plan');
    }
  };

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

  if (error) {
    console.log('Rendering error message:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  console.log('About to render main workflow with patient:', patient);
  console.log('Current activeStep:', activeStep);

  const stepOptions = [
    { 
      id: 1, 
      label: "Patient Information", 
      description: "Enter patient details and medical history",
      component: PatientInformation 
    },
    { 
      id: 2, 
      label: "Review & Finalize", 
      description: "Confirm treatment plan and medications",
      component: ReviewAndFinalize 
    },
    { 
      id: 3, 
      label: "Send to Patient", 
      description: "Confirm contact method and send report",
      component: SendToPatient 
    },
  ];

  return (
    <div className="flex h-full animate-fade-in">
      {useDemoData && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-100 text-yellow-800 p-2 text-center">
          Demo Mode: Using sample data (backend server may not be running)
        </div>
      )}
      <div className="w-[280px] border-x border-gray-200 bg-white">
        <WorkflowSteps
          activeStep={activeStep}
          onStepClick={handleStepClick}
          patient={patient}
          loading={loading}
          stepRefs={stepRefs}
          stepOptions={stepOptions}
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
                      loading,
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
                {patient && (
                  <ReviewAndFinalize 
                    patient={patient} 
                    onComplete={handleStepComplete}
                    services={initialServices}
                  />
                )}
              </div>
            </section>

            <section 
              ref={stepRefs[3]} 
              className="min-h-screen w-full flex items-center py-8"
            >
              <div className="w-full">
                {patient && (
                  <SendToPatient
                    patient={patient}
                    onStepComplete={handleStepComplete}
                    onFinish={sendReportToPatient}
                  />
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientWorkflow;
