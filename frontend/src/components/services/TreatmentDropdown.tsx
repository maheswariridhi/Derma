import React from "react";
import { Select } from "../ui/select";

interface Treatment {
  id: number;
  name: string;
  description: string;
  duration: string;
  cost: string;
}

interface TreatmentDropdownProps {
  treatments: Treatment[];
  onSelect: (treatment: Treatment) => void;
  label?: string;
  placeholder?: string;
}

const TreatmentDropdown: React.FC<TreatmentDropdownProps> = ({
  treatments,
  onSelect,
  label = "Select Treatment",
  placeholder = "Select a treatment...",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedTreatment = treatments.find(
      (treatment) => treatment.id.toString() === selectedId
    );
    if (selectedTreatment) {
      onSelect(selectedTreatment);
    }
  };

  const options = treatments.map((treatment) => ({
    value: treatment.id.toString(),
    label: `${treatment.name} - ${treatment.duration}`,
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

export default TreatmentDropdown; 