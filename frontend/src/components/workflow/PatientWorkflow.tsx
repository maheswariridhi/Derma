import React, { useState } from "react";
import { Patient, TreatmentPlan } from "../../types/workflow";
import PatientInformation from "./PatientInformation";
import ReviewAndFinalize from "./ReviewAndFinalize";
import SendToPatient from "./SendToPatient";
import PatientService from "../../services/PatientService";
import { toast } from "react-hot-toast";

type WorkflowStep = 1 | 2 | 3;

interface WorkflowState {
  activeStep: WorkflowStep;
  treatmentPlan: TreatmentPlan;
  patient: Patient;
}

interface Services {
  treatments: any[];
  medicines: any[];
}

const PatientWorkflow: React.FC<{ patient: Patient; services: Services }> = ({ patient, services }) => {
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    activeStep: 1,
    treatmentPlan: {
      diagnosis: "",
      diagnosisDetails: "",
      nextSteps: [],
      next_appointment: "",
      recommendations: [],
      additional_notes: "",
      selectedTreatments: [],
      selectedMedicines: []
    },
    patient
  });

  const handlePlanChange = (updatedPlan: TreatmentPlan) => {
    setWorkflowState(prev => ({
      ...prev,
      treatmentPlan: updatedPlan
    }));
  };

  const handleStepChange = (step: WorkflowStep) => {
    setWorkflowState(prev => ({
      ...prev,
      activeStep: step
    }));
  };

  const sendReportToPatient = async () => {
    try {
      await PatientService.sendPatientReport(workflowState.treatmentPlan);
      toast.success("Report sent successfully");
      handleStepChange(1); // Reset to first step
    } catch (error) {
      toast.error("Failed to send report");
      console.error("Error sending report:", error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {workflowState.activeStep === 1 && (
          <PatientInformation
            patient={workflowState.patient}
            onNext={() => handleStepChange(2)}
          />
        )}
        {workflowState.activeStep === 2 && (
          <ReviewAndFinalize
            patient={workflowState.patient}
            onPlanChange={handlePlanChange}
            services={services}
            onNext={() => handleStepChange(3)}
            onBack={() => handleStepChange(1)}
          />
        )}
        {workflowState.activeStep === 3 && (
          <SendToPatient
            patient={workflowState.patient}
            treatmentPlan={workflowState.treatmentPlan}
            onFinish={sendReportToPatient}
            onBack={() => handleStepChange(2)}
          />
        )}
      </div>
    </div>
  );
};

export default PatientWorkflow; 