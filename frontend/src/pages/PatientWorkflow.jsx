import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import PatientService from '../services/PatientService';
import WorkflowLayout from '../layouts/WorkflowLayout';
import PatientInformation from '../components/workflow/PatientInformation';
import ReviewAndFinalize from '../components/workflow/ReviewAndFinalize';
import SendToPatient from '../components/workflow/SendToPatient';
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
  }, [id]);

  const handleStepComplete = async (updatedPatient) => {
    try {
      setError(null);
      // Save step data
      await PatientService.updateWorkflowStep(id, updatedPatient, activeStep);
      setPatient(updatedPatient);
      
      // Move to next step or finish workflow
      if (activeStep < 3) {
        setActiveStep(prev => prev + 1);
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

  if (loading || !patient) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error: {error}
        <button 
          onClick={() => navigate(-1)}
          className="ml-4 text-blue-600 hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <PatientInformation 
            patient={patient}
            onComplete={handleStepComplete}
          />
        );
      case 2:
        return (
          <ReviewAndFinalize 
            patient={patient}
            onComplete={handleStepComplete}
          />
        );
      case 3:
        return (
          <SendToPatient 
            patient={patient}
            onComplete={handleStepComplete}
          />
        );
      default:
        return <PatientInformation patient={patient} />;
    }
  };

  return (
    <WorkflowLayout
      workflow={
        <>
          <div className="p-6 border-b">
            <button 
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              ← Back
            </button>
            <h2 className="text-xl font-bold mt-4">{patient.name}</h2>
            <p className="text-gray-600">{patient.phone}</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <WorkflowSteps 
              activeStep={activeStep}
              onStepClick={setActiveStep}
              steps={[
                { id: 1, label: 'Patient Information' },
                { id: 2, label: 'Review & Finalize' },
                { id: 3, label: 'Send to Patient' }
              ]}
            />
          </div>
        </>
      }
      content={
        <div className="p-6">
          {renderStepContent()}
        </div>
      }
    />
  );
};

export default PatientWorkflow;