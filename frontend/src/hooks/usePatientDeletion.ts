import { useState, useCallback } from 'react';
import PatientService from '../services/PatientService';
import toast from 'react-hot-toast';

interface Patient {
  id: string;
  name: string;
  [key: string]: any;
}

interface UsePatientDeletionReturn {
  isDeleteModalOpen: boolean;
  patientToDelete: Patient | null;
  openDeleteModal: (patient: Patient, e: React.MouseEvent) => void;
  closeDeleteModal: () => void;
  handleDeleteConfirm: () => Promise<boolean>;
  refreshPatients: () => void;
}

/**
 * Custom hook to handle patient deletion logic
 * @param onDeleteSuccess Callback function to execute after successful deletion
 * @param fetchPatientsCallback Optional callback to fetch patients data
 * @returns Object containing state and handlers for patient deletion
 */
const usePatientDeletion = (
  onDeleteSuccess: (deletedPatientId: string) => void,
  fetchPatientsCallback?: () => Promise<void>
): UsePatientDeletionReturn => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const openDeleteModal = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    setPatientToDelete(patient);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPatientToDelete(null);
  };

  const refreshPatients = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
    if (fetchPatientsCallback) {
      fetchPatientsCallback();
    }
  }, [fetchPatientsCallback]);

  const handleDeleteConfirm = async (): Promise<boolean> => {
    if (!patientToDelete) return false;
    
    // Show a loading toast
    const loadingToastId = toast.loading(`Deleting patient ${patientToDelete.name}...`);
    
    try {
      // Make the API call and wait for it to complete
      await PatientService.deletePatient(patientToDelete.id);
      
      // Only update state after successful API call
      onDeleteSuccess(patientToDelete.id);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToastId);
      toast.success(`Patient ${patientToDelete.name} deleted successfully`);
      
      // Refresh patients list to ensure UI is in sync with server
      refreshPatients();
      
      return true;
    } catch (error) {
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error deleting patient:", error);
      
      // Dismiss loading toast and show error
      toast.dismiss(loadingToastId);
      toast.error(`Failed to delete patient: ${errorMessage}`);
      
      return false;
    } finally {
      closeDeleteModal();
    }
  };

  return {
    isDeleteModalOpen,
    patientToDelete,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteConfirm,
    refreshPatients
  };
};

export default usePatientDeletion; 