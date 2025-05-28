import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import MedicationDropdown from "../services/MedicationDropdown";
import TreatmentDropdown from "../services/TreatmentDropdown";
import { MdMedicalServices, MdPsychology, MdAssistant, MdClose } from "react-icons/md";
import MedicationReminderService from "../../services/MedicationReminderService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { toast } from "react-hot-toast";

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
  // Add new fields for medication time and duration
  timeToTake?: string;
  durationDays?: number;
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
  medications: Array<{
    name: string;
    dosage: string;
    timeToTake?: string;
    durationDays?: number;
  }>;
  nextSteps: string[];
  next_appointment: string;
  recommendations: string[];
  additional_notes: string;
  selectedTreatments: Treatment[];
  selectedMedicines: Medicine[];
}

// Define Patient interface
interface Patient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  treatmentPlan?: TreatmentPlan;
}

// Define Props interface
interface ReviewAndFinalizeProps {
  patient: Patient;
  onPlanChange: (updatedPlan: TreatmentPlan) => void;
  services: Services;
}

const ReviewAndFinalize: React.FC<ReviewAndFinalizeProps> = ({
  patient,
  onPlanChange,
  services
}) => {
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan>({
    ...patient?.treatmentPlan,
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
  const [agentDialogOpen, setAgentDialogOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");
  const [isInitiating, setIsInitiating] = useState(false);
  const [itemNotes, setItemNotes] = useState<{ [key: string]: string }>({});
  
  const handleTreatmentSelect = (treatment: Treatment) => {
    const updatedPlan = {
      ...treatmentPlan,
      selectedTreatments: [...treatmentPlan.selectedTreatments, treatment]
    };
    setTreatmentPlan(updatedPlan);
    onPlanChange(updatedPlan);
  };

  const handleMedicineSelect = (medicine: Medicine) => {
    const medicineWithDefaults = {
      ...medicine,
      timeToTake: "08:00, 20:00",
      durationDays: 14
    };
    const updatedPlan = {
      ...treatmentPlan,
      selectedMedicines: [...treatmentPlan.selectedMedicines, medicineWithDefaults],
      medications: [
        ...treatmentPlan.medications,
        { 
          name: medicine.name, 
          dosage: medicine.dosage,
          timeToTake: medicineWithDefaults.timeToTake,
          durationDays: medicineWithDefaults.durationDays
        }
      ]
    };
    setTreatmentPlan(updatedPlan);
    onPlanChange(updatedPlan);
  };

  const removeTreatment = (treatmentId: number | string) => {
    const updatedTreatments = treatmentPlan.selectedTreatments.filter(
      treatment => treatment.id.toString() !== treatmentId.toString()
    );
    const updatedPlan = {
      ...treatmentPlan,
      selectedTreatments: updatedTreatments
    };
    setTreatmentPlan(updatedPlan);
    onPlanChange(updatedPlan);
  };

  const removeMedicine = (medicineId: number | string) => {
    // Remove from selectedMedicines array by id
    const updatedMedicines = treatmentPlan.selectedMedicines.filter(
      medicine => medicine.id.toString() !== medicineId.toString()
    );
    // Get the name of the medicine being removed
    const removedMedicine = treatmentPlan.selectedMedicines.find(
      medicine => medicine.id.toString() === medicineId.toString()
    );
    // Remove all medications with the same name
    const updatedMedications = treatmentPlan.medications.filter(
      medication => medication.name !== removedMedicine?.name
    );
    const updatedPlan = {
      ...treatmentPlan,
      selectedMedicines: updatedMedicines,
      medications: updatedMedications
    };
    setTreatmentPlan(updatedPlan);
    onPlanChange(updatedPlan);
  };

  // Update medicine time and duration
  const updateMedicineDetails = (medicineId: number, field: 'timeToTake' | 'durationDays', value: string | number) => {
    const updatedMedicines = treatmentPlan.selectedMedicines.map(medicine => {
      if (medicine.id === medicineId) {
        return { ...medicine, [field]: value };
      }
      return medicine;
    });
    
    // Also update in medications array
    const updatedMedications = treatmentPlan.medications.map(medication => {
      const matchingMedicine = updatedMedicines.find(m => m.name === medication.name);
      if (matchingMedicine) {
        return { 
          ...medication, 
          timeToTake: matchingMedicine.timeToTake,
          durationDays: matchingMedicine.durationDays
        };
      }
      return medication;
    });
    
    const updatedPlan = {
      ...treatmentPlan,
      selectedMedicines: updatedMedicines,
      medications: updatedMedications
    };
    
    setTreatmentPlan(updatedPlan);
    onPlanChange(updatedPlan);
  };

  const openAgentDialog = () => {
    // Create default initial message based on prescription
    let treatmentList = "";
    let medicationList = "";
    if (treatmentPlan.selectedTreatments.length > 0) {
      treatmentList = treatmentPlan.selectedTreatments.map(treat => {
        return `- ${treat.name}: ${treat.description} (Duration: ${treat.duration}, Cost: ${treat.cost})`;
      }).join("\n");
    }
    if (treatmentPlan.selectedMedicines.length > 0) {
      medicationList = treatmentPlan.selectedMedicines.map(med => {
        const timeInfo = med.timeToTake ? ` at ${med.timeToTake}` : '';
        const durationInfo = med.durationDays ? ` for ${med.durationDays} days` : '';
        return `- ${med.name} (${med.dosage})${timeInfo}${durationInfo}: ${med.usage || 'as prescribed'}`;
      }).join("\n");
    }
    
    let nextAppointment = "";
    if (treatmentPlan.next_appointment) {
      nextAppointment = `\n\nYour next appointment is scheduled for: ${treatmentPlan.next_appointment}.`;
    }
    
    let defaultMessage = `Hello ${patient.name}, I'm your assistant from DermaAI clinic.\n\n`;
    defaultMessage += `Dr. ${localStorage.getItem('doctorName') || 'your doctor'} has prescribed the following for your ${treatmentPlan.diagnosis || 'condition'}:\n\n`;
    if (treatmentList) {
      defaultMessage += `Treatments:\n${treatmentList}\n\n`;
    }
    if (medicationList) {
      defaultMessage += `Medications:\n${medicationList}\n\n`;
    }
    defaultMessage += nextAppointment;
    if (medicationList) {
      defaultMessage += `\n\nWhen would be a good time for me to remind you to take your medication(s)? For example, would morning (8am) and evening (8pm) work for you?`;
    }
    setInitialMessage(defaultMessage);
    
    setAgentDialogOpen(true);
  };

  const startConversationAgent = async () => {
    if (!patient || !treatmentPlan) {
      toast.error("Patient or treatment plan information is missing");
      return;
    }

    try {
      setIsInitiating(true);
      
      // Gather all selected treatments and medicines
      const allTreatments = treatmentPlan.selectedTreatments.map(treat => `${treat.name} (Duration: ${treat.duration}, Cost: ${treat.cost})`).join(", ");
      const allMedicines = treatmentPlan.selectedMedicines.map(med => `${med.name} (${med.dosage})`).join(", ");
      
      // Display an initial toast to indicate we're connecting
      const toastId = toast.loading("Connecting to AI services...");
      
      // Create a conversation with context about the entire prescription and treatment plan
      const response = await MedicationReminderService.initiateAgentConversation({
        patient_id: patient.id,
        patient_name: patient.name,
        message: initialMessage,
        medicine: allMedicines,
        prescription_details: {
          medicine_name: treatmentPlan.selectedMedicines[0]?.name || '',
          dosage: treatmentPlan.selectedMedicines[0]?.dosage || '',
          usage: treatmentPlan.selectedMedicines[0]?.usage || '',
          diagnosis: treatmentPlan.diagnosis,
          additional_notes: treatmentPlan.additional_notes,
          next_appointment: treatmentPlan.next_appointment,
          duration_days: treatmentPlan.selectedMedicines[0]?.durationDays || 14,
        }
      });

      // Clear the loading toast
      toast.dismiss(toastId);

      if (response.status === "success") {
        toast.success("Medication assistant has been initiated!");
      } else {
        toast.error(`Failed to initiate medication assistant: ${response.message || 'Unknown error'}`);
        console.error("Error from server:", response);
      }
      
      setAgentDialogOpen(false);
    } catch (error) {
      console.error("Error initiating conversation agent:", error);
      toast.error("Failed to initiate medication assistant: Connection error");
    } finally {
      setIsInitiating(false);
    }
  };

  // Check if there's at least one selected item (treatment or medication)
  const hasSelectedItems =
    (treatmentPlan.selectedMedicines && treatmentPlan.selectedMedicines.length > 0) ||
    (treatmentPlan.selectedTreatments && treatmentPlan.selectedTreatments.length > 0);

  // Combine selected treatments and medicines into a unified list
  const unifiedSelectedItems = [
    ...treatmentPlan.selectedTreatments.map(item => ({ ...item, itemType: "treatment" })),
    ...treatmentPlan.selectedMedicines.map(item => ({ ...item, itemType: "medicine" })),
  ];

  const handleNoteChange = (itemType: string, id: number, value: string) => {
    setItemNotes(prev => ({
      ...prev,
      [`${itemType}-${id}`]: value
    }));
  };

  // Add type guards for rendering unifiedSelectedItems
  const isTreatment = (item: any): item is Treatment & { itemType: string } => item.itemType === "treatment";
  const isMedicine = (item: any): item is Medicine & { itemType: string } => item.itemType === "medicine";

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
            <div className="flex gap-2">
              {hasSelectedItems && (
                <Button
                  variant="default"
                  onClick={() => openAgentDialog()}
                  className="flex items-center gap-2"
                >
                  <MdAssistant className="w-4 h-4" />
                  Activate Assistant
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  // Placeholder: Show a toast or alert instead of toggling AI insights
                  alert('AI Insights coming soon!');
                }}
                className="flex items-center gap-2"
              >
                <MdPsychology className="w-4 h-4" />
                Show AI Insights
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Dropdowns side by side */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <TreatmentDropdown
                treatments={services.treatments}
                onSelect={handleTreatmentSelect}
                selectedTreatments={treatmentPlan.selectedTreatments}
              />
              <MedicationDropdown
                medicines={services.medicines}
                onSelect={handleMedicineSelect}
                selectedMedicines={treatmentPlan.selectedMedicines}
              />
            </div>
            {/* Unified selected items list */}
            <div className="mt-4 max-h-[400px] overflow-y-auto pr-1">
              {unifiedSelectedItems.map((item) => {
                if (isTreatment(item)) {
                  return (
                    <div
                      key={`treatment-${item.id}`}
                      className="p-4 bg-gray-50 rounded-lg mb-3 relative hover:bg-gray-100"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-gray-500 hover:text-red-500"
                        onClick={() => removeTreatment(item.id)}
                      >
                        <MdClose className="h-4 w-4" />
                      </Button>
                      <div className="pr-8">
                        <h4 className="font-medium truncate">{item.name}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                        <div className="mt-2 text-sm text-gray-500 flex flex-wrap gap-1">
                          <span>Duration: {item.duration}</span>
                          <span className="mx-1">|</span>
                          <span>Cost: {item.cost}</span>
                        </div>
                        <div className="mt-2">
                          <Label className="text-xs block mb-1">Additional Notes</Label>
                          <Input
                            value={itemNotes[`treatment-${item.id}`] || ""}
                            onChange={e => handleNoteChange("treatment", item.id, e.target.value)}
                            placeholder="Add notes for this treatment..."
                            className="text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  );
                } else if (isMedicine(item)) {
                  return (
                    <div
                      key={`medicine-${item.id}`}
                      className="p-4 bg-gray-50 rounded-lg mb-3 relative hover:bg-gray-100"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-gray-500 hover:text-red-500"
                        onClick={() => removeMedicine(item.id)}
                      >
                        <MdClose className="h-4 w-4" />
                      </Button>
                      <div className="pr-8">
                        <h4 className="font-medium truncate">{item.name}</h4>
                        <p className="text-sm text-gray-600 truncate">
                          {item.type} - {item.usage}
                        </p>
                        <div className="mt-1 text-sm text-gray-500">
                          Dosage: {item.dosage}
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`medicine-time-${item.id}`} className="text-xs block mb-1">
                            Time to take
                          </Label>
                          <Input
                            id={`medicine-time-${item.id}`}
                            value={item.timeToTake || ""}
                            placeholder="08:00, 20:00"
                            onChange={(e) => updateMedicineDetails(item.id, 'timeToTake', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`medicine-duration-${item.id}`} className="text-xs block mb-1">
                            Duration (days)
                          </Label>
                          <Input
                            id={`medicine-duration-${item.id}`}
                            type="number"
                            min="1"
                            max="365"
                            value={item.durationDays || 14}
                            onChange={(e) => updateMedicineDetails(item.id, 'durationDays', parseInt(e.target.value) || 14)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <Label className="text-xs block mb-1">Additional Notes</Label>
                        <Input
                          value={itemNotes[`medicine-${item.id}`] || ""}
                          onChange={e => handleNoteChange("medicine", item.id, e.target.value)}
                          placeholder="Add notes for this medication..."
                          className="text-xs"
                        />
                      </div>
                    </div>
                  );
                } else {
                  return null;
                }
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      <Dialog open={agentDialogOpen} onOpenChange={setAgentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assistant</DialogTitle>
          </DialogHeader>
          <div className="mb-4 whitespace-pre-line">
            {initialMessage}
          </div>
          <DialogFooter>
            <Button
              onClick={startConversationAgent}
              disabled={isInitiating}
            >
              {isInitiating ? "Starting..." : "Start Assistant"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setAgentDialogOpen(false)}
              disabled={isInitiating}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewAndFinalize;