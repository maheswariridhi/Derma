import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Progress } from "../ui/progress";
import AIRecommendations from "../ai/AIRecommendations";
import AIChatbot from "../ai/AIChatbot";
import MedicationDropdown from "../services/MedicationDropdown";
import TreatmentDropdown from "../services/TreatmentDropdown";
import { MdMedicalServices, MdPsychology } from "react-icons/md";

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
export interface TreatmentPlan {
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
  services?: Services; // Make services optional for backward compatibility
}

const ReviewAndFinalize: React.FC<ReviewAndFinalizeProps> = ({
  patient,
  onComplete,
  services = {
    treatments: [],
    medicines: []
  }
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-blue-100">
                <MdMedicalServices className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-medium">Treatment Plan</h2>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAI(!showAI)}
              className="flex items-center gap-2"
            >
              <MdPsychology className="w-4 h-4" />
              {showAI ? 'Hide AI Insights' : 'Show AI Insights'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
                treatmentPlan={treatmentPlan}
                onUpdate={(updatedTreatment: TreatmentPlan) => {
                  setTreatmentPlan(updatedTreatment);
                  onComplete({ ...patient, treatmentPlan: updatedTreatment });
                }}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Selected Treatments</h3>
                  <TreatmentDropdown
                    treatments={services.treatments}
                    onSelect={handleTreatmentSelect}
                  />
                  <div className="mt-4">
                    {treatmentPlan.selectedTreatments?.map((treatment) => (
                      <div
                        key={treatment.id}
                        className="p-4 bg-gray-50 rounded-lg mb-2"
                      >
                        <h4 className="font-medium">{treatment.name}</h4>
                        <p className="text-sm text-gray-600">
                          {treatment.description}
                        </p>
                        <div className="flex justify-between mt-2 text-sm text-gray-500">
                          <span>{treatment.duration}</span>
                          <span>{treatment.cost}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Selected Medications</h3>
                  <MedicationDropdown
                    medicines={services.medicines}
                    onSelect={handleMedicineSelect}
                  />
                  <div className="mt-4">
                    {treatmentPlan.selectedMedicines?.map((medicine) => (
                      <div
                        key={medicine.id}
                        className="p-4 bg-gray-50 rounded-lg mb-2"
                      >
                        <h4 className="font-medium">{medicine.name}</h4>
                        <p className="text-sm text-gray-600">
                          {medicine.type} - {medicine.usage}
                        </p>
                        <div className="mt-2 text-sm text-gray-500">
                          Dosage: {medicine.dosage}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewAndFinalize;
