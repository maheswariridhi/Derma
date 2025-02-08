export const PatientStatus = {
  SAVED: "Saved",
  PENDING: "Pending",
  COMPLETED: "Completed",
  CONFIRMED: "Confirmed",
  ERROR: "Error",
} as const;

export type PatientStatusType = (typeof PatientStatus)[keyof typeof PatientStatus];

export const API_ENDPOINTS = {
  PATIENTS: "/patients",
  APPOINTMENTS: "/appointments",
  WORKFLOW: "/workflow",
} as const;

export const HOSPITAL = {
  ID: "hospital_dermai_01",
  NAME: "DermAI Clinic",
  TYPE: "Dermatology",
  LOCATION: "Mumbai",
} as const;

export const COLLECTIONS = {
  HOSPITALS: "hospitals",
  PATIENTS: "patients",
  APPOINTMENTS: "appointments",
  VISITS: "visits",
} as const;
