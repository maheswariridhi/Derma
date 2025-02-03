import React, { useState, useEffect } from 'react';
import { 
  Title, 
  Text, 
  Stack, 
  Button, 
  Timeline,
  Card,
  Group,
  Container,
  Accordion,
  ThemeIcon
} from '@mantine/core';
import { 
  IconStethoscope, 
  IconCalendar, 
  IconClipboardCheck,
  IconInfoCircle,
  IconChevronRight
} from '@tabler/icons-react';
import AIChatbot from '../ai/AIChatbot';

const ReviewAndFinalize = ({ patient, onComplete }) => {
  const [treatmentPlan, setTreatmentPlan] = useState({
    diagnosis: 'Missing Tooth - Medium Severity',
    diagnosisDetails: 'You have a missing tooth (tooth 19) on your lower left side. This can happen due to tooth decay, injury, or previous extractions. Normally, missing a tooth can cause neighboring teeth to shift into the empty space, leading to bite problems and changes in your facial structure.',
    visits: [
      {
        number: 1,
        title: 'Initial consultation and temporary solution',
        description: 'We will examine your condition and provide a temporary solution while preparing for the permanent treatment.'
      },
      {
        number: 2,
        title: 'Final restoration of missing tooth 19 with a fixed bridge',
        description: 'We will remove the temporary solution and carefully fit your new permanent bridge. We will make any necessary adjustments to ensure a perfect fit.'
      }
    ],
    whyYouShouldCare: 'Replacing your missing tooth will not only enhance your smile for your wedding photos but also prevent future dental issues caused by shifting teeth. We understand you had a terrible experience with a crown falling out in the past, which has caused you anxiety. Rest assured, we will take every precaution to ensure your new bridge is securely placed.',
    treatmentOptions: [
      {
        title: 'Fixed Dental Bridge',
        description: 'A fixed dental bridge involves placing crowns on the teeth adjacent to the gap (teeth 18 and 20) and attaching an artificial tooth (pontic) to fill the space of the missing tooth. This restores the function and appearance of your natural teeth.'
      }
    ]
  });

  const handleSaveAndContinue = () => {
    if (onComplete) {
      onComplete({ ...patient, treatmentPlan });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Timeline */}
      <div className="w-72 p-6 border-r border-gray-200 bg-white">
        <Stack spacing="xl">
          <Title order={4}>Finalize Case</Title>
          <Timeline active={1} bulletSize={28} lineWidth={2}>
            <Timeline.Item bullet={<IconClipboardCheck size={16} />} title="Patient Information" color="teal">
              <Text color="dimmed" size="sm">Review patient details</Text>
            </Timeline.Item>
            <Timeline.Item bullet={<IconStethoscope size={16} />} title="Review & Finalize" color="blue">
              <Text color="dimmed" size="sm">Check and confirm treatment plan</Text>
            </Timeline.Item>
            <Timeline.Item bullet={<IconCalendar size={16} />} title="Send to Patient">
              <Text color="dimmed" size="sm">Send finalized treatment plan</Text>
            </Timeline.Item>
          </Timeline>

          <Button variant="light" color="teal" fullWidth onClick={handleSaveAndContinue}>
            I'm finished reviewing
          </Button>
        </Stack>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Container size="lg">
            <Stack spacing="xl">
              {/* Diagnosis Section */}
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Title order={2} mb="md">{treatmentPlan.diagnosis}</Title>
                <Text>{treatmentPlan.diagnosisDetails}</Text>
              </Card>

              {/* Treatment Visits */}
              {treatmentPlan.visits.map((visit, index) => (
                <Card key={index} shadow="sm" p="lg" radius="md" withBorder>
                  <Group position="apart" mb="xs">
                    <Title order={4}>Visit {visit.number}</Title>
                    <Button 
                      variant="light" 
                      color="teal" 
                      rightIcon={<IconChevronRight size={16} />}
                    >
                      Schedule Visit {visit.number}
                    </Button>
                  </Group>
                  <Text>{visit.description}</Text>
                </Card>
              ))}

              {/* Why You Should Care Section */}
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Group mb="md">
                  <ThemeIcon size={32} radius="xl" color="teal">
                    <IconInfoCircle size={20} />
                  </ThemeIcon>
                  <Title order={4}>Why You Should Care</Title>
                </Group>
                <Text>{treatmentPlan.whyYouShouldCare}</Text>
              </Card>

              {/* Treatment Options */}
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Title order={4} mb="lg">Treatment Options Discussed</Title>
                {treatmentPlan.treatmentOptions.map((option, index) => (
                  <div key={index}>
                    <Text weight={500}>{option.title}</Text>
                    <Text color="dimmed" mt="xs">{option.description}</Text>
                  </div>
                ))}
              </Card>

              {/* AI Chatbot */}
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Title order={4} mb="md">Ask AI About Your Treatment</Title>
                <AIChatbot context={treatmentPlan} />
              </Card>
            </Stack>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default ReviewAndFinalize;
