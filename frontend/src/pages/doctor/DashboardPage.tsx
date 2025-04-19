import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PatientCard from "./PatientCard";
import PatientService from '../../services/PatientService';
import { Timestamp } from '../../types/common';
import { BsTrash } from "react-icons/bs";
import DeletePatientModal from "../../components/patients/DeletePatientModal";
import usePatientDeletion from "../../hooks/usePatientDeletion";

// Import Patient interface from PatientService to ensure consistency
// This prevents type mismatches between components
interface ServicePatient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  status: string;
  priority?: boolean;
  condition?: string;
  lastVisit?: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
  treatmentPlan?: {
    diagnosis?: string;
    currentStatus?: string;
    medications?: Array<{ name: string; dosage: string }>;
    nextSteps?: string[];
    next_appointment?: string;
    recommendations?: any[];
    additional_notes?: string;
  };
}

// Local interface that extends ServicePatient but adds fields needed locally
interface Patient extends ServicePatient {
  treatmentValue?: string;
  appointmentDate?: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const userName = "Ridhi Maheswari";

  // State for patients and search
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Use the patient deletion hook
  const { 
    isDeleteModalOpen, 
    patientToDelete, 
    openDeleteModal, 
    closeDeleteModal, 
    handleDeleteConfirm
  } = usePatientDeletion((deletedPatientId) => {
    // Update local state after successful deletion
    setPatients(patients.filter(p => p.id !== deletedPatientId));
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await PatientService.getPatients();
        // Transform data if needed to match local Patient interface
        const formattedData: Patient[] = Array.isArray(data) 
          ? data.map(p => ({
              ...p,
              id: p.id.toString(), // Ensure id is always string
              phone: p.phone || '', // Ensure required fields have defaults
              email: p.email || '',
            }))
          : [];
        setPatients(formattedData);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setPatients([]);
      }
    };

    fetchPatients();
  }, []);

  const handlePatientClick = (patient: Patient) => {
    // Set a loading indicator in localStorage before navigation
    localStorage.setItem('patientWorkflowLoading', 'true');
    
    // Navigate with patient data
    navigate(`../manage-patient/${patient.id}/workflow`, {
      state: { patient }
    });
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col p-6">
      <div className="bg-pink-50 rounded-lg p-6 mb-8">
        <h1 className="text-xl font-semibold">Good evening, {userName}</h1>
        <p className="text-gray-600 mt-2">
          You've got {patients.length} cases to follow up on today.
        </p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search patients by name"
          className="w-full p-2 border border-gray-300 rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredPatients.map((patient) => (
          <div key={patient.id} className="relative">
            <PatientCard
              patient={patient}
              onClick={() => handlePatientClick(patient)}
            />
            <button
              onClick={(e) => openDeleteModal(patient, e)}
              className="absolute top-4 right-4 text-red-600 p-2 rounded-full hover:bg-red-50"
              title="Delete patient"
            >
              <BsTrash size={18} />
            </button>
          </div>
        ))}
      </div>

      {patientToDelete && (
        <DeletePatientModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          patientName={patientToDelete.name}
        />
      )}
    </div>
  );
};

export default DashboardPage;