// Timestamp type for database timestamps
export type Timestamp = {
  toDate(): Date;
  toMillis(): number;
  seconds: number;
  nanoseconds: number;
};

// Unified Medicine interface
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

// Unified Treatment interface
export interface Treatment {
  id: number;
  name: string;
  description: string;
  duration: string;
  cost: string;
}

// Unified TreatmentPlan interface
export interface TreatmentPlan {
  diagnosis?: string;
  diagnosisDetails?: string;
  currentStatus?: string;
  medications?: Array<{ name: string; dosage: string }>;
  nextSteps?: string[];
  next_appointment?: string;
  recommendations?: any[];
  additional_notes?: string;
  selectedTreatments?: Treatment[];
  selectedMedicines?: Medicine[];
}

// Unified Patient interface
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

// Patient status enum for type safety
export enum PatientStatus {
  SAVED = "Saved",
  PENDING = "Pending", 
  COMPLETED = "Completed",
  CONFIRMED = "Confirmed",
  ERROR = "Error"
}

export type PatientStatusType = keyof typeof PatientStatus;

// Patient Report interface
export interface PatientReport {
  id?: string;
  patientId: string;
  diagnosis?: string;
  diagnosisDetails?: string;
  medications?: Array<{ name: string; dosage: string }>;
  nextSteps?: string[];
  next_appointment?: string;
  recommendations?: any[];
  additional_notes?: string;
  selectedTreatments?: Treatment[];
  selectedMedicines?: Medicine[];
  created_at?: string;
  doctor?: string;
  ai_summary?: string;
  ai_explanation?: string;
  messages?: {
    id: string;
    sender: 'patient' | 'doctor';
    content: string;
    timestamp: string;
  }[];
} 