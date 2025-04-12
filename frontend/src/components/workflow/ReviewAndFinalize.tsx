import React, { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Text,
  Stack,
  Card,
  Container,
  Group,
  ThemeIcon,
  ScrollArea,
  Progress,
  Stepper,
} from "@mantine/core";
import {
  IconStethoscope,
  IconCalendar,
  IconClipboardCheck,
  IconBrain,
} from "@tabler/icons-react";
import AIRecommendations from "../ai/AIRecommendations";
import AIChatbot from "../ai/AIChatbot";
import MedicationDropdown from "../services/MedicationDropdown";
import TreatmentDropdown from "../services/TreatmentDropdown";

// Define interfaces for treatments and medicines
interface Treatment {
  id: number;
  name: string;
  description: string;
  duration: string;
  cost: string;
}

interface Medicine {
  id: number;
  name: string;
  type: string;
  usage: string;
  dosage: string;
  stock: number;
}

// Define Services structure
interface Services {
  treatments: Treatment[];
  medicines: Medicine[];
}

// Define Treatment Plan interface
interface TreatmentPlan {
  diagnosis: string;
  diagnosisDetails: string;
  medications: { name: string; dosage: string }[];
  nextSteps: string[];
  next_appointment: string;
  recommendations: string[];
  additional_notes: string;
  selectedTreatments?: Treatment[];
  selectedMedicines?: Medicine[];
}

// Define Patient interface
interface Patient {
  id: string;
  name: string;
  treatmentPlan?: TreatmentPlan;
}

// Define Props interface
interface ReviewAndFinalizeProps {
  patient: Patient;
  onComplete: (updatedPatient: Patient) => void;
}

// Initial services data
const initialServices: Services = {
  treatments: [
    {
      id: 1,
      name: "Chemical Peel",
      description: "Exfoliating treatment to improve skin texture and tone",
      duration: "30-45 minutes",
      cost: "$150-300",
    },
    {
      id: 2,
      name: "Laser Hair Removal",
      description: "Permanent hair reduction using laser technology",
      duration: "15-60 minutes",
      cost: "$200-800",
    },
    {
      id: 3,
      name: "Acne Treatment",
      description: "Comprehensive treatment for active acne and scarring",
      duration: "45-60 minutes",
      cost: "$150-400",
    },
  ],
  medicines: [
    {
      id: 1,
      name: "Tretinoin",
      type: "Retinoid",
      usage: "Acne and anti-aging",
      dosage: "0.025%",
      stock: 75,
    },
    {
      id: 2,
      name: "Hyaluronic Acid",
      type: "Moisturizer",
      usage: "Hydration",
      dosage: "2%",
      stock: 80,
    },
    {
      id: 3,
      name: "Benzoyl Peroxide",
      type: "Antibacterial",
      usage: "Acne treatment",
      dosage: "5%",
      stock: 60,
    },
  ],
};

const ReviewAndFinalize: React.FC<ReviewAndFinalizeProps> = ({
  patient,
  onComplete,
}) => {
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan>({
    diagnosis: patient?.treatmentPlan?.diagnosis || "",
    diagnosisDetails: patient?.treatmentPlan?.diagnosisDetails || "",
    medications: patient?.treatmentPlan?.medications || [],
    nextSteps: patient?.treatmentPlan?.nextSteps || [],
    next_appointment: patient?.treatmentPlan?.next_appointment || "",
    recommendations: patient?.treatmentPlan?.recommendations || [],
    additional_notes: patient?.treatmentPlan?.additional_notes || "",
    selectedTreatments: patient?.treatmentPlan?.selectedTreatments || [],
    selectedMedicines: patient?.treatmentPlan?.selectedMedicines || [],
  });
  const [showAI, setShowAI] = useState(false);

  const handleTreatmentSelect = (treatment: Treatment) => {
    const updatedPlan = {
      ...treatmentPlan,
      selectedTreatments: [...(treatmentPlan.selectedTreatments || []), treatment]
    };
    setTreatmentPlan(updatedPlan);
    onComplete({ ...patient, treatmentPlan: updatedPlan });
  };

  const handleMedicineSelect = (medicine: Medicine) => {
    const updatedPlan = {
      ...treatmentPlan,
      selectedMedicines: [...(treatmentPlan.selectedMedicines || []), medicine],
      medications: [
        ...treatmentPlan.medications,
        { name: medicine.name, dosage: medicine.dosage }
      ]
    };
    setTreatmentPlan(updatedPlan);
    onComplete({ ...patient, treatmentPlan: updatedPlan });
  };

  return (
    <div className="space-y-6">
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <ThemeIcon size={36} radius="xl">
              <IconStethoscope size={20} />
            </ThemeIcon>
            <h2 className="text-xl font-medium">Treatment Plan</h2>
          </div>
          <button
            onClick={() => setShowAI(!showAI)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
          >
            <IconBrain size={16} />
            {showAI ? 'Hide AI Insights' : 'Show AI Insights'}
          </button>
        </div>

        {showAI ? (
          <div className="space-y-4">
            <AIRecommendations 
              treatmentData={treatmentPlan || {
                diagnosis: '',
                diagnosisDetails: '',
                medications: [],
                nextSteps: [],
                next_appointment: '',
                recommendations: [],
                additional_notes: ''
              }} 
            />
            <AIChatbot 
              context={treatmentPlan || {
                diagnosis: '',
                diagnosisDetails: '',
                medications: [],
                nextSteps: [],
                next_appointment: '',
                recommendations: [],
                additional_notes: ''
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TreatmentDropdown 
                treatments={initialServices.treatments}
                onSelect={handleTreatmentSelect}
                label="Select Treatment"
              />
              <MedicationDropdown 
                medicines={initialServices.medicines}
                onSelect={handleMedicineSelect}
                label="Select Medication"
              />
            </div>

            {treatmentPlan.selectedTreatments && treatmentPlan.selectedTreatments.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">Selected Treatments</h3>
                <div className="space-y-2">
                  {treatmentPlan.selectedTreatments.map((treatment, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md">
                      <div className="font-medium">{treatment.name}</div>
                      <div className="text-sm text-gray-500">{treatment.description}</div>
                      <div className="text-sm">Duration: {treatment.duration}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {treatmentPlan.medications && treatmentPlan.medications.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">Selected Medications</h3>
                <div className="space-y-2">
                  {treatmentPlan.medications.map((med, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md">
                      <div className="font-medium">{med.name}</div>
                      <div className="text-sm text-gray-500">Dosage: {med.dosage}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ReviewAndFinalize;
