import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import WorkflowLayout from '../layouts/WorkflowLayout';
import WorkflowSteps from '../components/workflow/WorkflowSteps';
import PatientInformation from '../components/workflow/PatientInformation';
import ReviewAndFinalize from '../components/workflow/ReviewAndFinalize';
import SendToPatient from '../components/workflow/SendToPatient';
import PatientService from '../services/PatientService';

const PatientWorkflow = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  useEffect(() => {
    const loadPatient = async () => {
      try {
        // Try to get patient from navigation state first
        if (location.state?.patient) {
          setPatient(location.state.patient);
        } else {
          // Fetch from service if not in navigation state
          const data = await PatientService.getPatientById(id);
          setPatient(data);
        }
      } catch (error) {
        console.error('Error loading patient:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [id, location.state]);

  const handleStepComplete = async (stepData) => {
    try {
      // Update patient data in service
      const updatedPatient = await PatientService.updateWorkflowStep(id, stepData, activeStep);
      setPatient(updatedPatient);
      
      // Move to next step if not on last step
      if (activeStep < 3) {
        setActiveStep(activeStep + 1);
      } else {
        // On last step, navigate back to appointments
        navigate('/appointments');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  if (loading || !patient) {
    return <div>Loading...</div>;
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