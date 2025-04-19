import { useState } from 'react';
import PatientService from '../services/PatientService';

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
}

/**
 * Custom hook to handle patient deletion logic
 * @param onDeleteSuccess Callback function to execute after successful deletion
 * @returns Object containing state and handlers for patient deletion
 */
const usePatientDeletion = (
  onDeleteSuccess: (deletedPatientId: string) => void
): UsePatientDeletionReturn => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const openDeleteModal = (patient: Patient, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    setPatientToDelete(patient);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPatientToDelete(null);
  };

  const handleDeleteConfirm = async (): Promise<boolean> => {
    if (!patientToDelete) return false;
    
    try {
      await PatientService.deletePatient(patientToDelete.id);
      onDeleteSuccess(patientToDelete.id);
      return true;
    } catch (error) {
      console.error("Error deleting patient:", error);
      alert("Failed to delete patient. Please try again.");
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
    handleDeleteConfirm
  };
};

export default usePatientDeletion; 