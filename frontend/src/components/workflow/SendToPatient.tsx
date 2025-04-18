import React, { useState } from "react";

// Define Treatment Plan interface
interface TreatmentPlan {
  diagnosis?: string;
  currentStatus?: string;
  medications?: { name: string }[];
}

// Define Patient interface
interface Patient {
  id: string;
  name: string;
  treatmentPlan?: TreatmentPlan;
  communicationPreference?: {
    method: string;
    notes: string;
  };
  status?: string;
}

interface SendToPatientProps {
  patient: Patient;
  onStepComplete: (updatedPatient: Patient) => void;
  onFinish: () => void;
}

const SendToPatient: React.FC<SendToPatientProps> = ({ patient, onStepComplete, onFinish }) => {
  const [communicationMethod, setCommunicationMethod] = useState<"email" | "sms">("email");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  const handleSubmit = () => {
    const updatedPatient = {
      ...patient,
      communicationPreference: {
        method: communicationMethod,
        notes: additionalNotes,
      },
      status: "Sent",
    };
    
    onStepComplete(updatedPatient);
    onFinish();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-medium mb-6">Send to Patient</h2>
      
      <div className="space-y-6">
        {/* Communication Method */}
        <div className="space-y-4">
          <label className="block text-sm font-medium">Communication Method</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="communicationMethod"
                checked={communicationMethod === 'email'}
                onChange={() => setCommunicationMethod('email')}
                className="mr-2"
              />
              Email
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="communicationMethod"
                checked={communicationMethod === 'sms'}
                onChange={() => setCommunicationMethod('sms')}
                className="mr-2"
              />
              SMS
            </label>
          </div>
        </div>

        {/* Treatment Summary */}
        <div className="space-y-4">
          <h3 className="font-medium">Treatment Summary</h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Diagnosis:</span>
              <span className="font-medium">{patient?.treatmentPlan?.diagnosis || "Not specified"}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium">{patient?.treatmentPlan?.currentStatus || "Not specified"}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Medications:</span>
              <span className="font-medium">
                {patient?.treatmentPlan?.medications?.length ? 
                  patient.treatmentPlan.medications.map(med => med.name).join(", ") : 
                  "None prescribed"}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">Additional Notes</label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Add any additional notes for the patient..."
            className="w-full p-3 border rounded-lg min-h-[120px]"
          />
        </div>

        {/* Confirmation */}
        <div className="pt-4 border-t">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              className="mr-2"
            />
            I confirm that all information is correct
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isConfirmed}
          className={`w-full py-4 rounded-lg ${
            isConfirmed 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Send Report to Patient
        </button>
      </div>
    </div>
  );
};

export default SendToPatient;
