import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PatientService from "../../services/PatientService";
import Table from "../../components/common/Table";
import { BsX } from "react-icons/bs";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";
import usePatientDeletion from "../../hooks/usePatientDeletion";
import AddPatientModal from "../../components/patient/AddPatientModal";

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
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const data: Patient[] = await PatientService.getPatients();
      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Use the patient deletion hook with our fetchPatients callback
  const { 
    isDeleteModalOpen, 
    patientToDelete, 
    openDeleteModal, 
    closeDeleteModal, 
    handleDeleteConfirm
  } = usePatientDeletion(
    (deletedPatientId) => {
      // Update local state after successful deletion
      setPatients(patients.filter(p => p.id !== deletedPatientId));
    },
    fetchPatients
  );

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted) return;
      await fetchPatients();
    };
    
    loadData();
    
    // Create a function to refresh data when component becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted) {
        loadData();
      }
    };
    
    // Listen for visibility changes to fetch fresh data when returning to tab
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup function
    return () => { 
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchPatients, refreshKey]);

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

  const handlePatientAdded = (patientId: string) => {
    setIsAddModalOpen(false);
    
    // Option 1: Fetch all patients again
    setRefreshKey(prevKey => prevKey + 1);
    
    // Option 2: Navigate to the new patient's page
    // navigate(`/clinic/manage-patient/${patientId}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patient Database</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add New Patient
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : (
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
      )}
      
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

      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handlePatientAdded}
      />
    </div>
  );
};

export default PatientDatabasePage;
