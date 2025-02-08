import React from "react";

// Define StepItem Props interface
interface StepItemProps {
  number: number;
  title: string;
  description: string;
  completed: boolean;
}

const StepItem: React.FC<StepItemProps> = ({ number, title, description, completed }) => {
  return (
    <div className={`p-4 rounded-lg ${completed ? "bg-green-50" : "bg-gray-50"}`}>
      <div className="flex items-center gap-3">
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
            completed ? "bg-green-700 text-white" : "bg-gray-300"
          }`}
        >
          {number}
        </span>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm text-gray-600 mt-2">{description}</p>
    </div>
  );
};

const TreatmentSteps: React.FC = () => {
  return (
    <div className="space-y-4">
      <StepItem
        number={1}
        title="Tell us about the patient"
        description="We use this information to make a case presentation."
        completed={true}
      />
      <StepItem
        number={2}
        title="Review and Finalize"
        description="Click on any text in the treatment plan to edit it."
        completed={true}
      />
      <StepItem
        number={3}
        title="Send to Patient"
        description="Send the treatment plan for review"
        completed={false}
      />
      <button className="w-full bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded">
        I'm finished reviewing
      </button>
    </div>
  );
};

export default TreatmentSteps;
