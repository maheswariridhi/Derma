import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import Modal from "./Modal";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemType?: string;
  itemName: string;
  title?: string;
  message?: string;
  useDialog?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemType = "item",
  itemName,
  title,
  message,
  useDialog = true,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  // Generate title and message if not provided
  const displayTitle = title || `Delete ${itemType}`;
  const displayMessage = message || 
    `Are you sure you want to delete ${itemType === "item" ? "" : itemType + " "}
    <span class="font-medium text-foreground">${itemName}</span>? 
    This action cannot be undone.`;

  // For backward compatibility, support both Dialog and Modal implementations
  if (useDialog) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              <DialogTitle>{displayTitle}</DialogTitle>
            </div>
            <DialogDescription className="pt-3">
              Are you sure you want to delete <span className="font-medium text-foreground">{itemName}</span>? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Use the old Modal for backward compatibility
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-semibold">{displayTitle}</h2>
          </div>
          <p className="text-gray-600">
            Are you sure you want to delete <span className="font-medium text-gray-900">{itemName}</span>? 
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
            onClick={handleConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal; 