import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Treatment {
  id: number;
  name: string;
  description: string;
  duration: string;
  cost: string;
  price?: string;
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
  const [selectedValue, setSelectedValue] = React.useState("");

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Select
        value={selectedValue}
        onValueChange={(value) => {
          const selectedTreatment = treatments.find(
            (treatment) => treatment.id.toString() === value
          );
          if (selectedTreatment) {
            onSelect(selectedTreatment);
            setSelectedValue("");
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {treatments.map((treatment) => (
            <SelectItem
              key={treatment.id}
              value={treatment.id.toString()}
              className="cursor-pointer"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-gray-900">{treatment.name}</span>
                <span className="text-xs text-gray-600">
                  {typeof treatment.duration === 'number'
                    ? `${treatment.duration} minutes`
                    : treatment.duration}
                  {treatment.price !== undefined && treatment.price !== null && treatment.price !== '' && (
                    <> - ${Number(treatment.price).toLocaleString()}</>
                  )}
                  {treatment.cost && (
                    <> - {treatment.cost}</>
                  )}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TreatmentDropdown; 