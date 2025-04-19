import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PatientService from "../../services/PatientService";
import Table from "../../components/common/Table";
import { BsX } from "react-icons/bs";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import usePatientDeletion from "../../hooks/usePatientDeletion";

// Define Patient interface
interface Patient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  condition?: string;
  lastVisit?: string;
}

const PatientDatabasePage: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  
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
        const data: Patient[] = await PatientService.getPatients();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
        setPatients([]);
      }
    };

    fetchPatients();
  }, []);

  const handlePatientClick = (patient: Patient) => {
    navigate(`/clinic/manage-patient/${patient.id}`);
  };

  const renderActions = (patient: Patient) => (
    <button
      onClick={(e) => openDeleteModal(patient, e)}
      className="text-black hover:text-gray-700"
      title="Delete patient"
    >
      <BsX size={16} />
    </button>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patient Database</h1>
        <button
          onClick={() => navigate("/clinic/manage-patients/new")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add New Patient
        </button>
      </div>
      <Table
        headers={[
          { key: "name", label: "Patient Name" },
          { key: "phone", label: "Phone" },
          { key: "email", label: "Email" },
          { key: "condition", label: "Condition" },
          { key: "lastVisit", label: "Last Visit" },
        ]}
        data={patients}
        onRowClick={handlePatientClick}
        actions={renderActions}
      />
      
      {patientToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteConfirm}
          itemType="patient"
          itemName={patientToDelete.name}
          useDialog={false}
        />
      )}
    </div>
  );
};

export default PatientDatabasePage;
