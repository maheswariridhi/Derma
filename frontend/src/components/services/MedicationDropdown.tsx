import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Medicine {
  id: number;
  name: string;
  type: string;
  usage: string;
  dosage: string;
  stock: number;
}

interface MedicationDropdownProps {
  medicines: Medicine[];
  onSelect: (medicine: Medicine) => void;
  label?: string;
  placeholder?: string;
}

const MedicationDropdown: React.FC<MedicationDropdownProps> = ({
  medicines,
  onSelect,
  label = "Select Medication",
  placeholder = "Select a medication...",
}) => {
  const [selectedValue, setSelectedValue] = React.useState<string>("");
  const [isOpen, setIsOpen] = React.useState(false);

  const handleValueChange = (value: string) => {
    const selectedMedicine = medicines.find(
      (medicine) => medicine.id.toString() === value
    );
    if (selectedMedicine) {
      onSelect(selectedMedicine);
      // Reset after a brief delay to allow the select to close properly
      setTimeout(() => {
        setSelectedValue("");
        setIsOpen(false);
      }, 100);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Select
        value={selectedValue}
        onValueChange={handleValueChange}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {medicines.map((medicine) => (
            <SelectItem
              key={medicine.id}
              value={medicine.id.toString()}
              className="cursor-pointer"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-gray-900">{medicine.name}</span>
                <span className="text-xs text-gray-600">
                  {medicine.dosage && <span>{medicine.dosage}</span>}
                  {medicine.type && <span className="ml-1">({medicine.type})</span>}
                </span>
                {medicine.stock !== undefined && medicine.stock !== null && (
                  <span className="text-xs text-gray-400">Stock: {medicine.stock}</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MedicationDropdown; 