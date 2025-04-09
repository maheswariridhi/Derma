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
  
  const [services] = useState<Services>(initialServices);

  const [activeSection, setActiveSection] = useState<
    "diagnosis" | "medications" | "next-steps"
  >("diagnosis");
  const [progress, setProgress] = useState<number>(0);

  const handleEdit = (section: keyof TreatmentPlan, value: any) => {
    setTreatmentPlan((prev) => ({
      ...prev,
      [section]: value,
    }));
    updateProgress();
  };

  const updateProgress = () => {
    let completed = 0;
    if (treatmentPlan.diagnosis) completed += 30;
    if (treatmentPlan.medications.length) completed += 30;
    if (treatmentPlan.nextSteps.length) completed += 40;
    setProgress(completed);
  };

  const handleSectionComplete = (section: keyof TreatmentPlan) => {
    const nextSection =
      section === "diagnosis"
        ? "medications"
        : section === "medications"
        ? "next-steps"
        : null;

    if (nextSection) {
      setActiveSection(nextSection);
    } else if (progress === 100) {
      onComplete({ ...patient, treatmentPlan });
    }
  };

  const handleTreatmentSelect = (treatment: Treatment) => {
    setTreatmentPlan((prev) => ({
      ...prev,
      selectedTreatments: [...(prev.selectedTreatments || []), treatment]
    }));
  };

  const handleMedicineSelect = (medicine: Medicine) => {
    setTreatmentPlan((prev) => ({
      ...prev,
      selectedMedicines: [...(prev.selectedMedicines || []), medicine],
      medications: [
        ...prev.medications, 
        { name: medicine.name, dosage: medicine.dosage }
      ]
    }));
    updateProgress();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Progress Header */}
      <div className="bg-white border-b px-6 py-4">
        <Group position="apart" mb="xs">
          <Title order={3}>Treatment Plan Review</Title>
          <Text color="dimmed">{progress}% Complete</Text>
        </Group>
        <Progress value={progress} size="sm" radius="xl" />
      </div>

      <ScrollArea className="flex-1 p-6">
        <Container size="lg">
          <Stack spacing="xl">
            <Stepper
              active={
                activeSection === "diagnosis"
                  ? 0
                  : activeSection === "medications"
                  ? 1
                  : 2
              }
              onStepClick={(step) => {
                const sections: ("diagnosis" | "medications" | "next-steps")[] =
                  ["diagnosis", "medications", "next-steps"];
                setActiveSection(sections[step]);
              }}
            >
              <Stepper.Step
                label="Diagnosis"
                description="Review patient details"
                icon={<IconClipboardCheck size={18} />}
              />
              <Stepper.Step
                label="Medications"
                description="Confirm medications"
                icon={<IconStethoscope size={18} />}
              />
              <Stepper.Step
                label="Next Steps"
                description="Plan follow-up"
                icon={<IconCalendar size={18} />}
              />
            </Stepper>

            {/* Dynamic Content */}
            <Card shadow="sm" p="lg" radius="md" withBorder>
              {/* Content sections remain the same but with smooth transitions */}
              <div className="transition-all duration-300">
                {activeSection === "diagnosis" && (
                  <div className="space-y-4">
                    <Title order={4}>Diagnosis Details</Title>
                    <Text>
                      {treatmentPlan.diagnosis || "Click to add diagnosis"}
                    </Text>
                    <Text>
                      {treatmentPlan.diagnosisDetails ||
                        "Add additional details..."}
                    </Text>
                  </div>
                )}

                {activeSection === "medications" && (
                  <div className="space-y-6">
                    <Title order={4}>Prescribed Medications</Title>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <TreatmentDropdown 
                          treatments={services.treatments}
                          onSelect={handleTreatmentSelect}
                          label="Select Treatment"
                        />
                      </div>
                      <div>
                        <MedicationDropdown 
                          medicines={services.medicines}
                          onSelect={handleMedicineSelect}
                          label="Select Medication"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Title order={5} className="mb-2">Selected Treatments</Title>
                      {treatmentPlan.selectedTreatments && treatmentPlan.selectedTreatments.length > 0 ? (
                        <div className="space-y-2">
                          {treatmentPlan.selectedTreatments.map((treatment, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-md">
                              <div className="font-medium">{treatment.name}</div>
                              <div className="text-sm text-gray-500">{treatment.description}</div>
                              <div className="text-sm">Duration: {treatment.duration}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Text color="gray">No treatments selected yet</Text>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <Title order={5} className="mb-2">Selected Medications</Title>
                      {treatmentPlan.medications.length > 0 ? (
                        <div className="space-y-2">
                          {treatmentPlan.medications.map((med, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-md">
                              <div className="font-medium">{med.name}</div>
                              <div className="text-sm">Dosage: {med.dosage}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Text color="gray">No medications selected yet</Text>
                      )}
                    </div>
                  </div>
                )}

                {activeSection === "next-steps" && (
                  <div className="space-y-4">
                    <Title order={4}>Treatment Timeline</Title>
                    {treatmentPlan.nextSteps.map((step, index) => (
                      <Text key={index}>{step}</Text>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* AI Recommendations - Always visible */}
            <Card shadow="sm" p="lg" radius="md" withBorder>
              <AIRecommendations treatmentData={treatmentPlan} />
            </Card>

            <Card shadow="sm" p="lg" radius="md" withBorder>
              <AIChatbot context={treatmentPlan} />
            </Card>
          </Stack>
        </Container>
      </ScrollArea>
    </div>
  );
};

export default ReviewAndFinalize;
