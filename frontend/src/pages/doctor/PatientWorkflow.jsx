import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Outlet } from 'react-router-dom';
import PatientService from '../../services/PatientService';
import WorkflowLayout from '../../layouts/WorkflowLayout';
import WorkflowSteps from '../../components/workflow/WorkflowSteps';

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

        let patientData = location.state?.patient;
        if (!patientData) {
          patientData = await PatientService.getPatientById(id);
        }
        if (!patientData) throw new Error('Patient not found');
        setPatient(patientData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [id, location.state]);

  const handleStepComplete = async (updatedPatient) => {
    try {
      await PatientService.updateWorkflowStep(id, updatedPatient, activeStep);
      setPatient(updatedPatient);

      if (activeStep < 3) {
        setActiveStep((prev) => prev + 1);
        navigate(`/clinic/manage-patient/${id}/workflow/${activeStep === 1 ? 'review' : 'send'}`);
      } else {
        navigate('/clinic/dashboard', { state: { message: 'Workflow completed' } });
      }
    } catch (error) {
      setError('Failed to update workflow.');
    }
  };

  const sendReportToPatient = async () => {
    try {
      if (!patient) return;
      await PatientService.sendPatientReport({ patientId: patient.id, ...patient.treatmentPlan });
      alert("Report sent successfully!");
      navigate(`/patient/dashboard`);
    } catch (error) {
      setError("Failed to send report.");
    }
  };

  return (
    <WorkflowLayout
      workflow={
        <div className="h-full flex flex-col">
          <div className="p-6 border-b">
            <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">← Back</button>
            <h2 className="text-xl font-bold mt-4">{patient?.name || 'Patient Workflow'}</h2>
            <p className="text-gray-600">{patient?.phone || ''}</p>
          </div>
          <WorkflowSteps
            activeStep={activeStep}
            onStepClick={(stepId) => {
              setActiveStep(stepId);
              navigate(`/clinic/manage-patient/${id}/workflow/${stepId === 1 ? 'information' : stepId === 2 ? 'review' : 'send'}`);
            }}
            steps={[
              { id: 1, label: 'Patient Information' },
              { id: 2, label: 'Review & Finalize' },
              { id: 3, label: 'Send to Patient' },
            ]}
          />
        </div>
      }
      content={
        <div className="p-6">
          <Outlet context={{ patient, onComplete: handleStepComplete, error, setError }} />
          {activeStep === 3 && (
            <div className="mt-6">
              <button className="w-full py-2 text-white bg-green-500 rounded-lg hover:bg-green-600" onClick={sendReportToPatient}>
                Send Report to Patient
              </button>
            </div>
          )}
        </div>
      }
    />
  );
};

export default PatientWorkflow;
