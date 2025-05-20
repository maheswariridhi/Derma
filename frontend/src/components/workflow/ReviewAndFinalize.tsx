import React, { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Progress } from "../ui/progress";
import AIRecommendations from "../ai/AIRecommendations";
import AIChatbot from "../ai/AIChatbot";
import MedicationDropdown from "../services/MedicationDropdown";
import TreatmentDropdown from "../services/TreatmentDropdown";
import { MdMedicalServices, MdPsychology, MdAssistant, MdClose } from "react-icons/md";
import MedicationReminderService from "../../services/MedicationReminderService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
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
  services?: Services; // Make services optional for backward compatibility
}

const ReviewAndFinalize: React.FC<ReviewAndFinalizeProps> = ({
  patient,
  onPlanChange,
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
  const [agentDialogOpen, setAgentDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [initialMessage, setInitialMessage] = useState("");
  const [isInitiating, setIsInitiating] = useState(false);
  const [medicationDuration, setMedicationDuration] = useState(14); // Default to 14 days (2 weeks)
  
  // Reference to maintain scroll position
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Save scroll position before update
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Save scroll position before update
  useEffect(() => {
    if (contentRef.current) {
      const handleScroll = () => {
        setScrollPosition(window.scrollY);
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Restore scroll position after state update
  useEffect(() => {
    if (scrollPosition > 0) {
      window.scrollTo(0, scrollPosition);
    }
  }, [treatmentPlan, scrollPosition]);

  const handleTreatmentSelect = (treatment: Treatment) => {
    if (contentRef.current) {
      setScrollPosition(window.scrollY);
    }
    const updatedPlan = {
      ...treatmentPlan,
      selectedTreatments: [...(treatmentPlan.selectedTreatments || []), treatment]
    };
    setTreatmentPlan(updatedPlan);
    onPlanChange(updatedPlan);
  };

  const handleMedicineSelect = (medicine: Medicine) => {
    if (contentRef.current) {
      setScrollPosition(window.scrollY);
    }
    const medicineWithDefaults = {
      ...medicine,
      timeToTake: "08:00, 20:00",
      durationDays: 14
    };
    const updatedPlan = {
      ...treatmentPlan,
      selectedMedicines: [...(treatmentPlan.selectedMedicines || []), medicineWithDefaults],
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

  const removeTreatment = (treatmentId: number) => {
    if (contentRef.current) {
      setScrollPosition(window.scrollY);
    }
    const updatedTreatments = treatmentPlan.selectedTreatments.filter(
      treatment => treatment.id !== treatmentId
    );
    const updatedPlan = {
      ...treatmentPlan,
      selectedTreatments: updatedTreatments
    };
    setTreatmentPlan(updatedPlan);
    onPlanChange(updatedPlan);
  };

  const removeMedicine = (medicineId: number) => {
    if (contentRef.current) {
      setScrollPosition(window.scrollY);
    }
    const updatedMedicines = treatmentPlan.selectedMedicines.filter(
      medicine => medicine.id !== medicineId
    );
    const updatedMedications = treatmentPlan.medications.filter(medication => {
      const matchingMedicine = treatmentPlan.selectedMedicines.find(
        m => m.id === medicineId && m.name === medication.name
      );
      return !matchingMedicine;
    });
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

  const openAgentDialog = (medicine: Medicine | null = null) => {
    setSelectedMedicine(medicine);
    
    // Create default initial message based on prescription
    let medicationList = "";
    if (treatmentPlan.selectedMedicines && treatmentPlan.selectedMedicines.length > 0) {
      medicationList = treatmentPlan.selectedMedicines.map(med => {
        const timeInfo = med.timeToTake ? ` at ${med.timeToTake}` : '';
        const durationInfo = med.durationDays ? ` for ${med.durationDays} days` : '';
        return `- ${med.name} (${med.dosage})${timeInfo}${durationInfo}: ${med.usage || 'as prescribed'}`;
      }).join("\n");
    } else if (medicine) {
      const timeInfo = medicine.timeToTake ? ` at ${medicine.timeToTake}` : '';
      const durationInfo = medicine.durationDays ? ` for ${medicine.durationDays} days` : '';
      medicationList = `- ${medicine.name} (${medicine.dosage})${timeInfo}${durationInfo}: ${medicine.usage || 'as prescribed'}`;
    }
    
    let nextAppointment = "";
    if (treatmentPlan.next_appointment) {
      nextAppointment = `\n\nYour next appointment is scheduled for: ${treatmentPlan.next_appointment}.`;
    }
    
    const defaultMessage = 
      `Hello ${patient.name}, I'm your medication assistant from DermaAI clinic.\n\n` +
      `Dr. ${localStorage.getItem('doctorName') || 'your doctor'} has prescribed the following medication(s) for your ${treatmentPlan.diagnosis || 'condition'}:\n\n` +
      medicationList + 
      nextAppointment + 
      `\n\nWhen would be a good time for me to remind you to take your medication(s)? For example, would morning (8am) and evening (8pm) work for you?`;
    
    setInitialMessage(defaultMessage);
    
    // Use duration from selected medicine if available
    if (medicine && medicine.durationDays) {
      setMedicationDuration(medicine.durationDays);
    } else if (treatmentPlan.selectedMedicines && treatmentPlan.selectedMedicines.length > 0) {
      // Use the first medicine's duration as default
      setMedicationDuration(treatmentPlan.selectedMedicines[0].durationDays || 14);
    } else {
      setMedicationDuration(14); // Default 2 weeks
    }
    
    setAgentDialogOpen(true);
  };

  const startConversationAgent = async () => {
    if (!patient || !treatmentPlan) {
      toast.error("Patient or treatment plan information is missing");
      return;
    }

    try {
      setIsInitiating(true);
      
      // Get the primary medication (first one) or use selected one
      const primaryMedicine = selectedMedicine || treatmentPlan.selectedMedicines[0];
      
      // List of all medications
      const allMedicines = treatmentPlan.selectedMedicines.map(med => 
        `${med.name} (${med.dosage})`
      ).join(", ");
      
      // Display an initial toast to indicate we're connecting
      const toastId = toast.loading("Connecting to AI services...");
      
      // Create a conversation with context about the entire prescription
      const response = await MedicationReminderService.initiateAgentConversation({
        patient_id: patient.id,
        patient_name: patient.name,
        message: initialMessage,
        medicine: allMedicines,
        prescription_details: {
          medicine_name: primaryMedicine.name,
          dosage: primaryMedicine.dosage,
          usage: primaryMedicine.usage || "as prescribed",
          diagnosis: treatmentPlan.diagnosis,
          additional_notes: treatmentPlan.additional_notes,
          next_appointment: treatmentPlan.next_appointment,
          duration_days: primaryMedicine.durationDays || 14
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

  // Check if there's at least one medication
  const hasMedications = treatmentPlan.selectedMedicines && treatmentPlan.selectedMedicines.length > 0;

  return (
    <div className="space-y-6" ref={contentRef}>
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
              {hasMedications && (
                <Button
                  variant="default"
                  onClick={() => openAgentDialog()}
                  className="flex items-center gap-2"
                >
                  <MdAssistant className="w-4 h-4" />
                  Activate Medication Assistant
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowAI(!showAI)}
                className="flex items-center gap-2"
              >
                <MdPsychology className="w-4 h-4" />
                {showAI ? 'Hide AI Insights' : 'Show AI Insights'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showAI ? (
            <div className="space-y-6">
              <AIRecommendations treatmentData={treatmentPlan} />
              <div className="border-t pt-4">
                <AIChatbot treatmentPlan={treatmentPlan} onUpdate={(updatedTreatment) => {
                  setTreatmentPlan(updatedTreatment);
                  onPlanChange(updatedTreatment);
                }} />
              </div>
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
                  <div className="mt-4 max-h-[400px] overflow-y-auto pr-1">
                    {treatmentPlan.selectedTreatments?.map((treatment) => (
                      <div
                        key={treatment.id}
                        className="p-4 bg-gray-50 rounded-lg mb-3 relative hover:bg-gray-100"
                      >
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 h-6 w-6 text-gray-500 hover:text-red-500"
                          onClick={() => removeTreatment(treatment.id)}
                        >
                          <MdClose className="h-4 w-4" />
                        </Button>
                        <div className="pr-8">
                          <h4 className="font-medium truncate">{treatment.name}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{treatment.description}</p>
                          <div className="mt-2 text-sm text-gray-500 flex flex-wrap gap-1">
                            <span>Duration: {treatment.duration}</span>
                            <span className="mx-1">|</span>
                            <span>Cost: {treatment.cost}</span>
                          </div>
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
                  <div className="mt-4 max-h-[400px] overflow-y-auto pr-1">
                    {treatmentPlan.selectedMedicines?.map((medicine) => (
                      <div
                        key={medicine.id}
                        className="p-4 bg-gray-50 rounded-lg mb-3 relative hover:bg-gray-100"
                      >
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-2 right-2 h-6 w-6 text-gray-500 hover:text-red-500"
                          onClick={() => removeMedicine(medicine.id)}
                        >
                          <MdClose className="h-4 w-4" />
                        </Button>
                        <div className="pr-8">
                          <h4 className="font-medium truncate">{medicine.name}</h4>
                          <p className="text-sm text-gray-600 truncate">
                            {medicine.type} - {medicine.usage}
                          </p>
                          <div className="mt-1 text-sm text-gray-500">
                            Dosage: {medicine.dosage}
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`medicine-time-${medicine.id}`} className="text-xs block mb-1">
                              Time to take
                            </Label>
                            <Input
                              id={`medicine-time-${medicine.id}`}
                              value={medicine.timeToTake || ""}
                              placeholder="08:00, 20:00"
                              onChange={(e) => updateMedicineDetails(medicine.id, 'timeToTake', e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`medicine-duration-${medicine.id}`} className="text-xs block mb-1">
                              Duration (days)
                            </Label>
                            <Input
                              id={`medicine-duration-${medicine.id}`}
                              type="number"
                              min="1"
                              max="365"
                              value={medicine.durationDays || 14}
                              onChange={(e) => updateMedicineDetails(medicine.id, 'durationDays', parseInt(e.target.value) || 14)}
                              className="text-sm"
                            />
                          </div>
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
      
      {/* Intelligent Agent Dialog */}
      <Dialog open={agentDialogOpen} onOpenChange={setAgentDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MdAssistant className="text-blue-600" />
              Activate Medication Assistant
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="medications">Medications</Label>
              <Input 
                id="medications" 
                value={selectedMedicine ? 
                  selectedMedicine.name : 
                  (treatmentPlan.selectedMedicines?.map(m => m.name).join(", ") || "")} 
                readOnly 
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="initialMessage">Initial Message</Label>
              <Textarea 
                id="initialMessage" 
                rows={10}
                value={initialMessage} 
                onChange={(e) => setInitialMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAgentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={startConversationAgent} 
              className="flex items-center gap-2"
              disabled={isInitiating}
            >
              {isInitiating ? "Starting..." : "Start Medication Assistant"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewAndFinalize;
