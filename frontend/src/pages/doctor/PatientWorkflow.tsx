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

interface TreatmentPlan {
  diagnosis: string;
  diagnosisDetails: string;
  medications: Array<{ name: string; dosage: string }>;
  nextSteps: string[];
  next_appointment: string;
  recommendations: any[];
  additional_notes: string;
}

interface Patient {
  id: string;
  name: string;
  treatmentPlan?: TreatmentPlan;
}

interface Props {
  patient: Patient;
  onComplete: (updatedPatient: Patient) => void;
}

const ReviewAndFinalize = ({ patient, onComplete }: Props) => {
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan>({
    diagnosis: patient?.treatmentPlan?.diagnosis || '',
    diagnosisDetails: patient?.treatmentPlan?.diagnosisDetails || '',
    medications: patient?.treatmentPlan?.medications || [],
    nextSteps: patient?.treatmentPlan?.nextSteps || [],
    next_appointment: patient?.treatmentPlan?.next_appointment || '',
    recommendations: patient?.treatmentPlan?.recommendations || [],
    additional_notes: patient?.treatmentPlan?.additional_notes || ''
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [progress, setProgress] = useState(0);

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

  const handleComplete = () => {
    if (progress === 100) {
      onComplete({ ...patient, treatmentPlan });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
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
                  {treatmentPlan.medications?.map((med, index) => (
                    <Text key={index} mb="xs">• {med.name} - {med.dosage}</Text>
                  ))}
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

const PatientWorkflow = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [error, setError] = useState(null);

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
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [id, location.state]);

  const handleStepComplete = async (updatedPatient) => {
    try {
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
        <div className="h-full flex flex-col">
          <div className="p-6 border-b">
            <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">← Back</button>
            <h2 className="text-xl font-bold mt-4">{patient?.name || 'Patient Workflow'}</h2>
            <p className="text-gray-600">{patient?.phone || ''}</p>
          </div>
          <WorkflowSteps
            activeStep={activeStep}
            onStepClick={(stepId) => {
              setActiveStep(stepId);
              navigate(`/clinic/manage-patient/${id}/workflow/${stepId === 1 ? 'information' : stepId === 2 ? 'review' : 'send'}`);
            }}
            steps={[
              { id: 1, label: 'Patient Information' },
              { id: 2, label: 'Review & Finalize' },
              { id: 3, label: 'Send to Patient' },
            ]}
          />
        </div>
      }
      content={
        <div className="p-6">
          <Outlet context={{ patient, onComplete: handleStepComplete, error, setError }} />
          {activeStep === 3 && (
            <div className="mt-6">
              <button className="w-full py-2 text-white bg-green-500 rounded-lg hover:bg-green-600" onClick={sendReportToPatient}>
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
