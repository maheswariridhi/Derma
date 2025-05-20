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
  const [selectedValue, setSelectedValue] = React.useState("");

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Select
        value={selectedValue}
        onValueChange={(value) => {
          const selectedMedicine = medicines.find(
            (medicine) => medicine.id.toString() === value
          );
          if (selectedMedicine) {
            onSelect(selectedMedicine);
            setSelectedValue(""); // Reset to placeholder after selection
          }
        }}
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
              <div className="flex flex-col">
                <span className="font-medium">{medicine.name}</span>
                <span className="text-sm text-gray-500">
                  {medicine.dosage} ({medicine.type})
                </span>
                <span className="text-xs text-gray-400">
                  Stock: {medicine.stock}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MedicationDropdown; 