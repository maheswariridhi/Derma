'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Outlet } from 'react-router-dom';
import PatientService from '../../services/PatientService';
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
  status?: string;
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
  const [progress, setProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai'>('overview');
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  console.log('PatientWorkflow rendering with ID:', id); // Debug log

  // Add scroll tracking to update active step
  const [scrollRefs] = useState({
    information: React.createRef<HTMLDivElement>(),
    review: React.createRef<HTMLDivElement>(),
    send: React.createRef<HTMLDivElement>()
  });

  // Track scroll position to update active step
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight } = e.currentTarget;
    const scrollPosition = scrollTop + clientHeight / 3; // Adjust trigger point
    
    // Find which section is currently most visible
    if (scrollRefs.information.current && 
        scrollRefs.review.current && 
        scrollRefs.send.current) {
      
      const informationPos = scrollRefs.information.current.offsetTop;
      const reviewPos = scrollRefs.review.current.offsetTop;
      const sendPos = scrollRefs.send.current.offsetTop;
      
      if (scrollPosition < reviewPos) {
        if (activeStep !== 1) setActiveStep(1);
      } else if (scrollPosition < sendPos) {
        if (activeStep !== 2) setActiveStep(2);
      } else {
        if (activeStep !== 3) setActiveStep(3);
      }
    }
  };

  useEffect(() => {
    const loadPatient = async () => {
      // Prevent multiple loads
      if (hasLoaded) return;
      
      console.log('Loading patient data...'); // Debug log
      try {
        setLoading(true);
        setError(null);

        // If we have patient data in location state, use it directly
        if (location.state?.patient) {
          console.log('Using patient data from location state:', location.state.patient);
          setPatient(location.state.patient);
          setHasLoaded(true);
          setLoading(false);
          return;
        }

        // Only fetch from API if we don't have the data in location state
        if (!id) {
          throw new Error('Patient ID is required');
        }

        console.log('Fetching patient data from service...');
        const patientData = await PatientService.getPatientById(id);
        if (!patientData) throw new Error('Patient not found');
        console.log('Patient data loaded:', patientData);
        setPatient(patientData);
        setHasLoaded(true);
      } catch (error) {
        console.error('Error loading patient:', error);
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [id, location.state, hasLoaded]);

  const handleStepComplete = async (updatedPatient: Patient) => {
    try {
      if (!id) {
        throw new Error('Patient ID is required');
      }
      
      // Update the patient data in the backend
      await PatientService.updatePatientStatus(id, updatedPatient.status || 'active');
      setPatient(updatedPatient);
      
      // Don't automatically navigate to next step
      // Let scrolling handle the step changes
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

  // Show loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-800 font-medium mb-2">Error Loading Patient</p>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show error if patient is null
  if (!patient) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-800 font-medium mb-2">Patient Not Found</p>
          <p className="text-gray-600">The requested patient could not be found.</p>
          <button 
            onClick={() => navigate('/clinic/dashboard')}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Workflow Steps Panel (Middle) */}
      <div className="w-[280px] border-x border-gray-200 bg-white overflow-y-auto">
        <div className="border-b p-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">{patient?.name || 'Patient'}</h2>
          </div>
        </div>
        
        <div className="flex-1">
          <WorkflowSteps
            activeStep={activeStep}
            onStepClick={(stepId: number) => {
              console.log('Step clicked:', stepId);
              setActiveStep(stepId);
              const section = stepId === 1 ? scrollRefs.information.current :
                             stepId === 2 ? scrollRefs.review.current :
                             scrollRefs.send.current;
                             
              if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            steps={[
              { 
                id: 1, 
                label: 'Tell us about the patient',
                description: 'Basic patient details'
              },
              { 
                id: 2, 
                label: 'Review and Finalize',
                description: 'Review treatment plan to edit it and send it to the patient'
              },
              { 
                id: 3, 
                label: 'Send to Patient',
                description: 'Send the completed treatment plan to patient'
              },
            ]}
          />
        </div>
      </div>

      {/* Content Area (Right) */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {/* Section 1: Patient Information */}
          <div ref={scrollRefs.information} className="mb-16">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h1 className="text-2xl font-medium text-gray-800">Patient Information</h1>
              </div>
              <div className="p-6">
                <Outlet context={{ patient, onComplete: handleStepComplete, error, setError }} />
              </div>
            </div>
          </div>
          
          {/* Section 2: Review & Finalize */}
          <div ref={scrollRefs.review} className="mb-16">
            <ReviewAndFinalize patient={patient} onComplete={handleStepComplete} />
          </div>
          
          {/* Section 3: Send to Patient */}
          <div ref={scrollRefs.send} className="mb-16">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h1 className="text-2xl font-medium text-gray-800">Send to Patient</h1>
              </div>
              <div className="p-6">
                {activeStep === 3 && (
                  <div className="space-y-8">
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium text-blue-800 mb-2">Ready to Send</h3>
                      <p className="text-blue-700">
                        The treatment plan is ready to be sent to {patient?.name}. 
                        Please review all information once more before sending.
                      </p>
                    </div>
                    
                    <button 
                      className="w-full py-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-lg font-medium"
                      onClick={sendReportToPatient}
                    >
                      Send Treatment Plan to Patient
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientWorkflow;
