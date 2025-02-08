import React, { useState } from "react";
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

// Define Treatment Plan interface
interface TreatmentPlan {
  diagnosis: string;
  diagnosisDetails: string;
  medications: { name: string; dosage: string }[];
  nextSteps: string[];
  next_appointment: string;
  recommendations: string[];
  additional_notes: string;
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
  });

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
                  <div className="space-y-4">
                    <Title order={4}>Prescribed Medications</Title>
                    {treatmentPlan.medications.map((med, index) => (
                      <Text key={index}>
                        {med.name} - {med.dosage}
                      </Text>
                    ))}
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
