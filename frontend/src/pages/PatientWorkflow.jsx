import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Outlet } from 'react-router-dom';
import PatientService from '../services/PatientService';
import WorkflowLayout from '../layouts/WorkflowLayout';
import WorkflowSteps from '../components/workflow/WorkflowSteps';

const PatientWorkflow = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First try to get patient from navigation state
        let patientData = location.state?.patient;
        
        // If no patient in state, fetch from service
        if (!patientData) {
          patientData = await PatientService.getPatientById(id);
        }
        
        if (!patientData) {
          throw new Error('Patient not found');
        }
        
        setPatient(patientData);
      } catch (error) {
        setError(error.message);
        console.error('Error loading patient:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [id, location.state]);

  const handleStepComplete = async (updatedPatient) => {
    try {
      setError(null);
      // Save step data
      await PatientService.updateWorkflowStep(id, updatedPatient, activeStep);
      setPatient(updatedPatient);
      
      // Move to next step or finish workflow
      if (activeStep < 3) {
        setActiveStep(prev => prev + 1);
        // Update URL to match new step
        const nextPath = activeStep === 1 ? 'review' : 'send';
        navigate(`/patient/${id}/workflow/${nextPath}`);
      } else {
        // Workflow complete, redirect to dashboard
        navigate('/dashboard', { 
          state: { message: 'Patient workflow completed successfully' } 
        });
      }
    } catch (error) {
      setError('Failed to save workflow step');
      console.error('Error updating workflow:', error);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">
          <p>Error: {error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <WorkflowLayout
      workflow={
        <div className="h-full flex flex-col">
          <div className="p-6 border-b">
            <button 
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              ← Back
            </button>
            <h2 className="text-xl font-bold mt-4">{patient?.name || 'Patient Workflow'}</h2>
            <p className="text-gray-600">{patient?.phone || ''}</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <WorkflowSteps 
              activeStep={activeStep}
              onStepClick={(stepId) => {
                setActiveStep(stepId);
                const path = stepId === 1 ? 'information' : stepId === 2 ? 'review' : 'send';
                navigate(`/patient/${id}/workflow/${path}`);
              }}
              steps={[
                { id: 1, label: 'Patient Information' },
                { id: 2, label: 'Review & Finalize' },
                { id: 3, label: 'Send to Patient' }
              ]}
            />
          </div>
        </div>
      }
      content={
        <div className="p-6">
          <Outlet context={{ 
            patient, 
            onComplete: handleStepComplete,
            error,
            setError 
          }} />
        </div>
      }
    />
  );
};

export default PatientWorkflow;