import React, { useState, useEffect } from "react";
import PatientService from "../../services/PatientService";
import { toast } from "react-toastify";

// Define Patient interface
interface Patient {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  condition?: string;
  lastVisit?: string;
  treatmentPlan?: any;
}

interface Services {
  treatments: any[];
  medicines: any[];
}

interface PatientInformationProps {
  patient: Patient | null;
  onStepComplete: (updatedPatient: Patient) => void;
  loading: boolean;
  services: Services;
}

const PatientInformation: React.FC<PatientInformationProps> = ({ 
  patient, 
  onStepComplete, 
  loading,
  services
}) => {
  const [editedPatient, setEditedPatient] = useState<Patient | null>(null);

  // Update editedPatient when patient data changes
  useEffect(() => {
    if (patient) {
      setEditedPatient(patient);
    }
  }, [patient]);

  const handleSubmit = async () => {
    try {
      if (!editedPatient?.id) {
        throw new Error("Patient ID is required");
      }
      await PatientService.updatePatient(editedPatient.id, editedPatient);
      onStepComplete(editedPatient);
      toast.success("Patient information saved successfully");
    } catch (error) {
      console.error("Failed to update patient:", error);
      toast.error("Failed to update patient information");
    }
  };

  if (loading || !editedPatient) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="w-8 h-8 border-b-2 border-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Get today's date in yyyy-mm-dd format
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
        <input
          type="text"
          value={editedPatient.name || ""}
          readOnly
          className="w-full p-2.5 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
        <input
          type="text"
          value={editedPatient.phone || ""}
          readOnly
          className="w-full p-2.5 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
        <input
          type="email"
          value={editedPatient.email || ""}
          readOnly
          className="w-full p-2.5 border border-gray-300 rounded-lg"
        />
      </div>
      {/* Medical Information */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Condition</label>
        <input
          type="text"
          value={"Summary of last visit will appear here..."}
          readOnly
          className="w-full p-2.5 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Additional Notes</label>
        <input
          type="text"
          value={"(Additional notes placeholder)"}
          readOnly
          className="w-full p-2.5 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
        <input
          type="date"
          value={todayStr}
          readOnly
          className="w-full p-2.5 border border-gray-300 rounded-lg"
        />
      </div>
    </div>
  );
};

export default PatientInformation;
