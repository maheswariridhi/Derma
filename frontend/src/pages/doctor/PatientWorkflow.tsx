'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import PatientService from '../../services/PatientService';
import WorkflowSteps, { Step } from '../../components/workflow/WorkflowSteps';
import ReviewAndFinalize from '../../components/workflow/ReviewAndFinalize';
import SendToPatient from '../../components/workflow/SendToPatient';
import axios from "axios";

// Patient interface used across components
interface Patient {
  id: string;
  name: string;
  phone?: string;
  treatmentPlan?: any;
  status?: string;
}

const API_BASE_URL = "http://localhost:8000/api";

const PatientWorkflow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Consolidated state management
  const [patient, setPatient] = useState<Patient | null>(location.state?.patient || null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [treatmentPlan, setTreatmentPlan] = useState<any>(patient?.treatmentPlan || {});
  const [services, setServices] = useState({ treatments: [], medicines: [] });

  const contentRef = useRef<HTMLDivElement>(null);
  const stepRefs = {
    1: useRef<HTMLDivElement>(null),
    2: useRef<HTMLDivElement>(null),
    3: useRef<HTMLDivElement>(null),
  };

  // Define step options with consistent naming and structure
  const stepOptions: Step[] = [
    { 
      id: 1, 
      label: "Tell us about the patient", 
      description: "Basic patient details",
      status: activeStep === 1 ? "Current" : ""
    },
    { 
      id: 2, 
      label: "Review and Finalize", 
      description: "Review treatment plan to edit it and send it to the patient"
    },
    { 
      id: 3, 
      label: "Send to Patient", 
      description: "Send the completed treatment plan to patient"
    },
  ];

  // Handle scroll synchronization
  const handleScroll = useCallback(() => {
    if (!contentRef.current || isScrolling) return;

    const { scrollTop, clientHeight } = contentRef.current;
    const step = Math.round(scrollTop / clientHeight) + 1;
    
    if (step >= 1 && step <= stepOptions.length) {
      setActiveStep(step);
    }
  }, [isScrolling, stepOptions.length]);

  // Handle step click and smooth scroll
  const handleStepClick = useCallback((step: number) => {
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
        return;
      }

      try {
        // Try to get patient data from API
        if (id) {
          const data = await PatientService.getPatientById(id);
          
          if (data && mounted) {
            setPatient(prevPatient => ({
              ...prevPatient,
              ...data,
            }));
          } else if (mounted) {
            // If no data but API didn't throw, set error
            setError('Patient not found');
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
  }, [id, location.state, patient]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const [treatmentsData, medicinesData] = await Promise.all([
          axios.get(`${API_BASE_URL}/treatments`).then(res => res.data),
          axios.get(`${API_BASE_URL}/medicines`).then(res => res.data)
        ]);
        setServices({ treatments: treatmentsData, medicines: medicinesData });
      } catch (err) {
        console.error("Failed to fetch services", err);
      }
    };
    fetchServices();
  }, []);

  // Prevent body scroll during loading
  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [loading]);

  // Update local treatment plan only
  const handlePlanChange = (updatedPlan: any) => {
    setTreatmentPlan(updatedPlan);
    setPatient((prev) => prev ? { ...prev, treatmentPlan: updatedPlan } : prev);
  };

  // Only send to backend when finalized (in SendToPatient)
  const handleStepComplete = async (updatedPatient: Patient) => {
    try {
      if (!id) {
        console.error('Cannot update patient: ID is missing');
        setError('Missing patient ID');
        return;
      }
      // Only send finalized treatmentPlan to backend if status is 'Sent'
      if (updatedPatient.status === 'Sent') {
        await PatientService.updatePatient(id, updatedPatient);
        setPatient(updatedPatient);
        toast.success('Treatment plan sent to patient');
      }
      const nextStep = Math.min(activeStep + 1, stepOptions.length);
      setActiveStep(nextStep);
      handleStepClick(nextStep);
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

  if (error) {
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

  return (
    <div className="flex h-full animate-fade-in">
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
        <div className="w-full p-4">
          <div className="space-y-0">
            <section 
              ref={stepRefs[1]} 
              className="min-h-screen w-full flex items-start pt-0 first:pt-0 last:pb-0"
            >
              <div className="w-full">
                <Outlet context={{ 
                  patient,
                  loading,
                  onStepComplete: handleStepComplete,
                  onFinish: sendReportToPatient,
                  stepRefs,
                  services
                }} />
              </div>
            </section>

            <section 
              ref={stepRefs[2]} 
              className="min-h-screen w-full flex items-start pt-0"
            >
              <div className="w-full">
                {patient && (
                  <ReviewAndFinalize 
                    patient={patient} 
                    onPlanChange={handlePlanChange}
                    services={services}
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
