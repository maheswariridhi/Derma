import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import PatientService from "../../services/PatientService";

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

// Define context interface
interface OutletContext {
  patient: Patient | null;
  onComplete: (updatedPatient: Patient) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const PatientInformation: React.FC = () => {
  const { patient, onComplete, setError } = useOutletContext<OutletContext>();
  const [editedPatient, setEditedPatient] = useState<Patient | null>(null);

  // Update editedPatient when patient data changes
  useEffect(() => {
    if (patient) {
      setEditedPatient(patient);
    }
  }, [patient]);

  // Add loading state
  if (!editedPatient) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="w-8 h-8 border-b-2 border-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleSubmit = async () => {
    try {
      if (!editedPatient.id) {
        throw new Error("Patient ID is required");
      }
      await PatientService.updatePatient(editedPatient.id, editedPatient);
      onComplete(editedPatient);
    } catch (error) {
      console.error("Failed to update patient:", error);
      setError((error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Name
            </label>
            <input
              type="text"
              value={editedPatient?.name || ""}
              onChange={(e) =>
                setEditedPatient(prev => prev ? { ...prev, name: e.target.value } : null)
              }
              className="w-full p-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Phone
            </label>
            <input
              type="text"
              value={editedPatient.phone || ""}
              onChange={(e) =>
                setEditedPatient({ ...editedPatient, phone: e.target.value })
              }
              className="w-full p-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              value={editedPatient.email || ""}
              onChange={(e) =>
                setEditedPatient({ ...editedPatient, email: e.target.value })
              }
              className="w-full p-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Medical Information */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Condition
            </label>
            <input
              type="text"
              value={editedPatient.condition || ""}
              onChange={(e) =>
                setEditedPatient({ ...editedPatient, condition: e.target.value })
              }
              className="w-full p-2.5 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Last Visit
            </label>
            <input
              type="date"
              value={editedPatient.lastVisit || ""}
              onChange={(e) =>
                setEditedPatient({ ...editedPatient, lastVisit: e.target.value })
              }
              className="w-full p-2.5 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            className="w-full py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Save and Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientInformation;
