import React from "react";
import Modal from "../common/Modal";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface DeletePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  patientName: string;
}

const DeletePatientModal: React.FC<DeletePatientModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  patientName,
}) => {
  const handleDelete = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold">Delete Patient</h2>
          </div>
          <p className="text-gray-600">
            Are you sure you want to delete <span className="font-medium text-gray-900">{patientName}</span>? 
            This action cannot be undone.
          </p>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeletePatientModal; 