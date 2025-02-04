import React, { useState } from 'react';
import { 
  Paper, 
  Title, 
  Text, 
  Stack, 
  Timeline,
  Card,
  Container,
  Group,
  Button,
  ThemeIcon,
  ScrollArea
} from '@mantine/core';
import { 
  IconStethoscope, 
  IconCalendar, 
  IconClipboardCheck,
  IconPencil,
  IconSend
} from '@tabler/icons-react';
import AIRecommendations from "../../components/ai/AIRecommendations";
import AIChatbot from "../../components/ai/AIChatbot";

const ReviewAndFinalize = ({ patient, onComplete }) => {
  const [treatmentPlan, setTreatmentPlan] = useState({
    diagnosis: patient?.treatmentPlan?.diagnosis || '',
    medications: patient?.treatmentPlan?.medications || [],
    nextSteps: patient?.treatmentPlan?.nextSteps || [],
    recommendations: patient?.treatmentPlan?.recommendations || [],
  });

  const [activeSection, setActiveSection] = useState('diagnosis');

  const handleSaveAndContinue = () => {
    if (onComplete) {
      onComplete({ ...patient, treatmentPlan });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Sidebar Navigation */}
      <Paper className="w-80 p-6 border-r shadow-md bg-white">
        <Stack spacing="lg">
          <Title order={4}>Finalize Treatment Plan</Title>
          
          <Timeline active={activeSection === 'diagnosis' ? 0 : activeSection === 'medications' ? 1 : 2} bulletSize={24} lineWidth={2}>
            <Timeline.Item 
              bullet={<IconClipboardCheck size={16} />} 
              title="Patient Information" 
              onClick={() => setActiveSection('diagnosis')}
            >
              <Text color="dimmed" size="sm">Review patient details</Text>
            </Timeline.Item>

            <Timeline.Item 
              bullet={<IconStethoscope size={16} />} 
              title="Medications" 
              onClick={() => setActiveSection('medications')}
            >
              <Text color="dimmed" size="sm">Review prescribed medications</Text>
            </Timeline.Item>

            <Timeline.Item 
              bullet={<IconCalendar size={16} />} 
              title="Next Steps" 
              onClick={() => setActiveSection('next-steps')}
            >
              <Text color="dimmed" size="sm">Plan follow-up visits</Text>
            </Timeline.Item>
          </Timeline>

          <Button 
            variant="filled" 
            color="teal" 
            fullWidth 
            onClick={handleSaveAndContinue}
            leftIcon={<IconSend size={16} />}
          >
            Finalize & Send
          </Button>
        </Stack>
      </Paper>

      {/* Right Panel - Scrollable Treatment Report */}
      <div className="flex-1 h-screen overflow-hidden">
        <ScrollArea className="h-full p-8">
          <Container size="lg">
            <Stack spacing="xl">
              
              {/* Diagnosis Section */}
              {activeSection === 'diagnosis' && (
                <Card shadow="sm" p="lg" radius="md" withBorder>
                  <Group position="apart" mb="md">
                    <Title order={3}>Diagnosis</Title>
                    <Button variant="light" leftIcon={<IconPencil size={16} />} size="xs">
                      Edit
                    </Button>
                  </Group>
                  <Text>{treatmentPlan.diagnosis || 'No diagnosis provided.'}</Text>
                </Card>
              )}

              {/* Medications Section */}
              {activeSection === 'medications' && (
                <Card shadow="sm" p="lg" radius="md" withBorder>
                  <Group position="apart" mb="md">
                    <Title order={3}>Medications</Title>
                    <Button variant="light" leftIcon={<IconPencil size={16} />} size="xs">
                      Add Medication
                    </Button>
                  </Group>
                  {treatmentPlan.medications.length ? (
                    <Stack>
                      {treatmentPlan.medications.map((med, index) => (
                        <Text key={index}>{med.name} - {med.dosage}</Text>
                      ))}
                    </Stack>
                  ) : <Text color="dimmed">No medications prescribed.</Text>}
                </Card>
              )}

              {/* Next Steps Section */}
              {activeSection === 'next-steps' && (
                <Card shadow="sm" p="lg" radius="md" withBorder>
                  <Group position="apart" mb="md">
                    <Title order={3}>Next Steps</Title>
                    <Button variant="light" leftIcon={<IconPencil size={16} />} size="xs">
                      Add Step
                    </Button>
                  </Group>
                  {treatmentPlan.nextSteps.length ? (
                    <Stack>
                      {treatmentPlan.nextSteps.map((step, index) => (
                        <Text key={index}>{step}</Text>
                      ))}
                    </Stack>
                  ) : <Text color="dimmed">No next steps assigned yet.</Text>}
                </Card>
              )}

              {/* AI Recommendations */}
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Title order={4} mb="md">AI Recommendations</Title>
                <AIRecommendations treatmentData={treatmentPlan} />
              </Card>

              {/* AI Chatbot */}
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Title order={4} mb="md">Ask AI Assistant</Title>
                <AIChatbot context={treatmentPlan} />
              </Card>

            </Stack>
          </Container>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ReviewAndFinalize;
