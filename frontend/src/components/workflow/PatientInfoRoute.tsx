import React from 'react';
import { useOutletContext } from 'react-router-dom';
import PatientInformation from './PatientInformation';

interface WorkflowContext {
  patient: any;
  loading: boolean;
  onStepComplete: (updatedPatient: any) => void;
  services: any;
  onFinish: () => void;
  stepRefs: any;
}

const PatientInfoRoute: React.FC = () => {
  const { patient, loading, onStepComplete, services } = useOutletContext<WorkflowContext>();

  return (
    <PatientInformation
      patient={patient}
      onStepComplete={onStepComplete}
      loading={loading}
      services={services}
    />
  );
};

export default PatientInfoRoute; 