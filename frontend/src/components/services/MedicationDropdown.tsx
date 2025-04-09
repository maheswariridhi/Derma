import React from "react";
import { Select } from "../ui/select";

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
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedMedicine = medicines.find(
      (medicine) => medicine.id.toString() === selectedId
    );
    if (selectedMedicine) {
      onSelect(selectedMedicine);
    }
  };

  const options = medicines.map((medicine) => ({
    value: medicine.id.toString(),
    label: `${medicine.name} - ${medicine.dosage} (${medicine.type})`,
  }));

  return (
    <Select
      label={label}
      options={options}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
};

export default MedicationDropdown; 