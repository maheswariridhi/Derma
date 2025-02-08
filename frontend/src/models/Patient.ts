import { PatientStatus, PatientStatusType } from "./constants";

// Define TreatmentPlan interface
interface TreatmentPlan {
  diagnosis: string;
  currentStatus: string;
  medications: string[];
  nextSteps: string[];
}

// Define Patient interface
interface PatientInterface {
  id?: string;
  name?: string;
  status?: PatientStatusType;
  phone?: string;
  email?: string;
  appointmentDate?: string;
  condition?: string;
  lastVisit?: string;
  treatmentPlan?: TreatmentPlan;
}

export class Patient {
  id: string;
  name: string;
  status: PatientStatusType;
  phone: string;
  email: string;
  appointmentDate: string;
  condition: string;
  lastVisit: string;
  treatmentPlan: TreatmentPlan;

  constructor(data: PatientInterface = {}) {
    this.id = data.id || "";
    this.name = data.name || "";
    this.status = data.status || PatientStatus.PENDING;
    this.phone = data.phone || "";
    this.email = data.email || "";
    this.appointmentDate = data.appointmentDate || "";
    this.condition = data.condition || "";
    this.lastVisit = data.lastVisit || "";
    this.treatmentPlan = data.treatmentPlan || {
      diagnosis: "",
      currentStatus: "",
      medications: [],
      nextSteps: [],
    };
  }

  getStatusStyle(): string {
    const styles: Record<PatientStatusType, string> = {
      [PatientStatus.SAVED]: "text-green-600 bg-green-100",
      [PatientStatus.PENDING]: "text-yellow-600 bg-yellow-100",
      [PatientStatus.COMPLETED]: "text-blue-600 bg-blue-100",
      [PatientStatus.CONFIRMED]: "text-purple-600 bg-purple-100",
      [PatientStatus.ERROR]: "text-red-600 bg-red-100",
    };
    return styles[this.status] || styles[PatientStatus.PENDING];
  }
}

export default Patient;
