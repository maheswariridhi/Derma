import { Timestamp } from './common';

export interface TreatmentPlan {
  diagnosis?: string;
  diagnosisDetails?: string;
  currentStatus?: string;
  medications?: Array<{ name: string; dosage: string }>;
  nextSteps?: string[];
  next_appointment?: string;
  recommendations?: any[];
  additional_notes?: string;
  selectedTreatments?: any[];
  selectedMedicines?: any[];
}

export interface Patient {
  id: string;
  name: string;
  status: string;
  phone?: string;
  email?: string;
  condition?: string;
  lastVisit?: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
  treatmentPlan?: TreatmentPlan;
  treatmentValue?: string;
  appointmentDate?: string;
  priority?: boolean;
  communicationPreference?: {
    method: string;
    notes: string;
  };
}

export interface PatientFilters {
  status?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
} 