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

// Helper for date formatting
function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// InfoRow component for each field
function InfoRow({ icon, label, value }: { icon: string; label: string; value?: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
      <span className="text-xl select-none">{icon}</span>
      <span className="w-32 font-medium text-gray-600">{label}</span>
      <span className="flex-1 text-right text-gray-900">{value || '-'}</span>
    </div>
  );
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
    <div className="max-w-xl mx-auto mt-10 p-8 rounded-2xl shadow-xl bg-white/70 backdrop-blur-lg border border-blue-200">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-black">
        <span className="text-3xl select-none">🧑‍⚕️</span>
        Patient Information
      </h2>
      <div className="space-y-6">
        <InfoRow icon="👤" label="Name" value={editedPatient.name} />
        <InfoRow icon="📞" label="Phone" value={editedPatient.phone} />
        <InfoRow icon="✉️" label="Email" value={editedPatient.email} />
        <div className="rounded-lg bg-blue-50/60 p-4 flex items-start gap-3">
          <span className="text-2xl select-none text-blue-400 mt-1">💡</span>
          <div>
            <div className="font-semibold text-blue-700">Condition</div>
            <div className="text-gray-700">Summary of last visit will appear here...</div>
          </div>
        </div>
        <div className="rounded-lg bg-purple-50/60 p-4 flex items-start gap-3">
          <span className="text-2xl select-none text-purple-400 mt-1">📝</span>
          <div>
            <div className="font-semibold text-purple-700">Additional Notes</div>
            <div className="text-gray-700">(Additional notes placeholder)</div>
          </div>
        </div>
        <InfoRow icon="📅" label="Date" value={formatDate(todayStr)} />
      </div>
    </div>
  );
};

export default PatientInformation;
