'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Outlet } from 'react-router-dom';
import PatientService from '../../services/PatientService';
import WorkflowLayout from '../../layouts/WorkflowLayout';
import WorkflowSteps from '../../components/workflow/WorkflowSteps';
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
  Tabs
} from '@mantine/core';
import { 
  IconStethoscope, 
  IconCalendar, 
  IconClipboardCheck,
  IconBrain
} from '@tabler/icons-react';
import AIRecommendations from "../../components/ai/AIRecommendations";
import AIChatbot from "../../components/ai/AIChatbot";
import MedicationDropdown from "../../components/services/MedicationDropdown";
import TreatmentDropdown from "../../components/services/TreatmentDropdown";

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

interface Services {
  treatments: Treatment[];
  medicines: Medicine[];
}

interface TreatmentPlan {
  diagnosis: string;
  diagnosisDetails: string;
  medications: Array<{ name: string; dosage: string }>;
  nextSteps: string[];
  next_appointment: string;
  recommendations: any[];
  additional_notes: string;
  selectedTreatments?: Treatment[];
  selectedMedicines?: Medicine[];
}

interface Patient {
  id: string;
  name: string;
  phone?: string;
  treatmentPlan?: TreatmentPlan;
}

interface Props {
  patient: Patient;
  onComplete: (updatedPatient: Patient) => void;
}

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

const ReviewAndFinalize: React.FC<Props> = ({ patient, onComplete }) => {
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan>({
    diagnosis: patient?.treatmentPlan?.diagnosis || '',
    diagnosisDetails: patient?.treatmentPlan?.diagnosisDetails || '',
    medications: patient?.treatmentPlan?.medications || [],
    nextSteps: patient?.treatmentPlan?.nextSteps || [],
    next_appointment: patient?.treatmentPlan?.next_appointment || '',
    recommendations: patient?.treatmentPlan?.recommendations || [],
    additional_notes: patient?.treatmentPlan?.additional_notes || '',
    selectedTreatments: patient?.treatmentPlan?.selectedTreatments || [],
    selectedMedicines: patient?.treatmentPlan?.selectedMedicines || [],
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'ai'>('overview');
  const [progress, setProgress] = useState<number>(0);
  const [services] = useState<Services>(initialServices);

  useEffect(() => {
    updateProgress();
  }, [treatmentPlan]);

  const updateProgress = () => {
    let completed = 0;
    if (treatmentPlan.diagnosis) completed += 30;
    if (treatmentPlan.medications?.length) completed += 30;
    if (treatmentPlan.nextSteps?.length) completed += 40;
    setProgress(completed);
  };

  const handleEdit = (section: keyof TreatmentPlan, value: any) => {
    setTreatmentPlan(prev => ({
      ...prev,
      [section]: value
    }));
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

  const handleComplete = () => {
    if (progress === 100) {
      onComplete({ ...patient, treatmentPlan });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="bg-white border-b px-6 py-4">
        <Group position="apart" mb="xs">
          <Title order={3}>Treatment Plan Review</Title>
          <Text color="dimmed">{progress}% Complete</Text>
        </Group>
        <Progress value={progress} size="sm" radius="xl" />
      </div>

      <ScrollArea className="flex-1">
        <Container size="lg" className="py-6">
          <Stack spacing="xl">
            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.List>
                <Tabs.Tab value="overview" icon={<IconClipboardCheck size={16} />}>
                  Overview
                </Tabs.Tab>
                <Tabs.Tab value="ai" icon={<IconBrain size={16} />}>
                  AI Insights
                </Tabs.Tab>
              </Tabs.List>
            </Tabs>

            {activeTab === 'overview' ? (
              <>
                <Card shadow="sm" p="lg" radius="md" withBorder>
                  <Group mb="md">
                    <ThemeIcon size={36} radius="xl">
                      <IconStethoscope size={20} />
                    </ThemeIcon>
                    <div>
                      <Title order={4}>Diagnosis</Title>
                      <Text size="sm" color="dimmed">Review patient details</Text>
                    </div>
                  </Group>
                  <Text>{treatmentPlan.diagnosis || 'Click to add diagnosis'}</Text>
                  <Text mt="sm" color="dimmed">{treatmentPlan.diagnosisDetails}</Text>
                </Card>

                <Card shadow="sm" p="lg" radius="md" withBorder>
                  <Title order={4} mb="md">Prescribed Medications</Title>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                    <h5 className="font-medium mb-2">Selected Treatments</h5>
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
                      <Text color="dimmed">No treatments selected yet</Text>
                    )}
                  </div>

                  <div className="mt-4">
                    <h5 className="font-medium mb-2">Selected Medications</h5>
                    {treatmentPlan.medications?.map((med, index) => (
                      <Text key={index} mb="xs">• {med.name} - {med.dosage}</Text>
                    ))}
                  </div>
                </Card>

                <Card shadow="sm" p="lg" radius="md" withBorder>
                  <Group mb="md">
                    <ThemeIcon size={36} radius="xl">
                      <IconCalendar size={20} />
                    </ThemeIcon>
                    <div>
                      <Title order={4}>Next Steps</Title>
                      <Text size="sm" color="dimmed">Plan follow-up care</Text>
                    </div>
                  </Group>
                  {treatmentPlan.nextSteps?.map((step, index) => (
                    <Text key={index} mb="xs">{index + 1}. {step}</Text>
                  ))}
                </Card>
              </>
            ) : (
              <>
                <Card shadow="sm" p="lg" radius="md" withBorder>
                  <AIRecommendations treatmentData={treatmentPlan} />
                </Card>
                <Card shadow="sm" p="lg" radius="md" withBorder>
                  <AIChatbot context={treatmentPlan} />
                </Card>
              </>
            )}

            {progress === 100 && (
              <button 
                onClick={handleComplete}
                className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Complete Review
              </button>
            )}
          </Stack>
        </Container>
      </ScrollArea>
    </div>
  );
};

const PatientWorkflow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        setLoading(true);
        setError(null);

        let patientData = location.state?.patient;
        if (!patientData) {
          patientData = await PatientService.getPatientById(id);
        }
        if (!patientData) throw new Error('Patient not found');
        setPatient(patientData);
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [id, location.state]);

  const handleStepComplete = async (updatedPatient: Patient) => {
    try {
      if (!id) return;
      await PatientService.updateWorkflowStep(id, updatedPatient, activeStep);
      setPatient(updatedPatient);

      if (activeStep < 3) {
        setActiveStep((prev) => prev + 1);
        navigate(`/clinic/manage-patient/${id}/workflow/${activeStep === 1 ? 'review' : 'send'}`);
      } else {
        navigate('/clinic/dashboard', { state: { message: 'Workflow completed' } });
      }
    } catch (error) {
      setError('Failed to update workflow.');
    }
  };

  const sendReportToPatient = async () => {
    try {
      if (!patient) return;
      await PatientService.sendPatientReport({ patientId: patient.id, ...patient.treatmentPlan });
      alert("Report sent successfully!");
      navigate(`/patient/dashboard`);
    } catch (error) {
      setError("Failed to send report.");
    }
  };

  return (
    <WorkflowLayout
      workflow={
        <div className="h-full bg-white">
          <div className="p-6 border-b">
            <button 
              onClick={() => navigate(-1)} 
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-4"
            >
              ← Back
            </button>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{patient?.name}</h2>
              <p className="text-gray-600">{patient?.phone}</p>
            </div>
          </div>
          
          <div className="p-4">
            <WorkflowSteps
              activeStep={activeStep}
              onStepClick={(stepId: number) => {
                setActiveStep(stepId);
                navigate(`/clinic/manage-patient/${id}/workflow/${
                  stepId === 1 ? 'information' : 
                  stepId === 2 ? 'review' : 'send'
                }`);
              }}
              steps={[
                { 
                  id: 1, 
                  label: 'Patient Information',
                  description: 'Basic patient details'
                },
                { 
                  id: 2, 
                  label: 'Review & Finalize',
                  description: 'Review treatment plan'
                },
                { 
                  id: 3, 
                  label: 'Send to Patient',
                  description: 'Send report to patient'
                },
              ]}
            />
          </div>
        </div>
      }
      content={
        <div className="h-full bg-white p-6">
          <Outlet context={{ patient, onComplete: handleStepComplete, error, setError }} />
          {activeStep === 3 && (
            <div className="mt-auto pt-6 border-t">
              <button 
                className="w-full py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                onClick={sendReportToPatient}
              >
                Send Report to Patient
              </button>
            </div>
          )}
        </div>
      }
    />
  );
};

export default PatientWorkflow;
