export interface Medicine {
  id: number;
  name: string;
  type: string;
  usage: string;
  dosage: string;
  stock: number;
  timeToTake?: string;
  durationDays?: number;
}

export interface Treatment {
  id: number;
  name: string;
  description: string;
  duration: string;
  cost: string;
}

export interface TreatmentPlan {
  diagnosis: string;
  diagnosisDetails: string;
  nextSteps: string[];
  next_appointment: string;
  recommendations: string[];
  additional_notes: string;
  selectedTreatments: Treatment[];
  selectedMedicines: Medicine[];
}

export interface Patient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  treatmentPlan?: TreatmentPlan;
  status?: string;
  condition?: string;
  lastVisit?: string;
  communicationPreference?: {
    method: string;
    notes: string;
  };
} 