import { Timestamp, timestampToDate } from '../types/common';
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api"; // FastAPI backend URL with /api prefix

// Utility function for handling API errors
const handleApiError = (error: any, operation: string): never => {
  console.error(`Error ${operation}:`, error);
  if (axios.isAxiosError(error)) {
    console.error(`API Error Status: ${error.response?.status}`);
  }
  throw new Error(`Failed to ${operation}: ${(error as Error).message}`);
};

// Define interfaces based on the existing structure
interface Patient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  status: string;
  priority?: boolean;
  condition?: string;
  lastVisit?: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
  treatmentPlan?: {
    diagnosis?: string;
    currentStatus?: string;
    medications?: Array<{ name: string; dosage: string }>;
    nextSteps?: string[];
    next_appointment?: string;
    recommendations?: any[];
    additional_notes?: string;
  };
}

interface QueueEntry {
  id: string;
  patientId: string;
  queueType: string;
  tokenNumber: number;
  status: string;
  date: string;
  checkInTime: Timestamp;
  estimatedWaitTime?: number;
}

interface PatientFilters {
  status?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

// Define the PatientReport interface
interface PatientReport {
  id?: string;
  patientId: string;
  diagnosis?: string;
  diagnosisDetails?: string;
  medications?: Array<{ name: string; dosage: string }>;
  nextSteps?: string[];
  next_appointment?: string;
  recommendations?: any[];
  additional_notes?: string;
  selectedTreatments?: any[];
  selectedMedicines?: any[];
  created_at?: Timestamp;
  doctor?: string;
  messages?: {
    id: string;
    sender: 'patient' | 'doctor';
    content: string;
    timestamp: Timestamp;
  }[];
}

interface PatientProfileData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
}

const PatientService = {
  async getPatients(filters: PatientFilters = {}): Promise<Patient[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/patients`, { params: filters });
      return response.data;
    } catch (error) {
      return handleApiError(error, "fetching patients");
    }
  },

  async getQueuePatients(): Promise<QueueEntry[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/queue/patients`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "fetching queue");
    }
  },

  async updatePatientStatus(patientId: string, newStatus: string): Promise<boolean> {
    try {
      await axios.put(`${API_BASE_URL}/patients/${patientId}/status`, { status: newStatus });
      return true;
    } catch (error) {
      return handleApiError(error, "updating patient status");
    }
  },

  async prioritizePatient(patientId: string): Promise<boolean> {
    try {
      await axios.put(`${API_BASE_URL}/patients/${patientId}/priority`);
      return true;
    } catch (error) {
      return handleApiError(error, "prioritizing patient");
    }
  },

  async checkInPatient(patientId: string, queueType: string = "check-up"): Promise<number> {
    try {
      const response = await axios.post(`${API_BASE_URL}/queue/check-in`, {
        patientId,
        queueType
      });
      return response.data.tokenNumber;
    } catch (error) {
      return handleApiError(error, "checking in patient");
    }
  },

  async getQueueStatus(): Promise<Record<string, QueueEntry[]>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/queue/status`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "getting queue status");
    }
  },

  async updateQueueStatus(queueId: string, newStatus: string): Promise<void> {
    try {
      await axios.put(`${API_BASE_URL}/queue/${queueId}/status`, { status: newStatus });
    } catch (error) {
      return handleApiError(error, "updating queue status");
    }
  },

  calculateWaitingTime(checkInTime?: Timestamp): string {
    if (!checkInTime) return "N/A";
    const now = new Date();
    const checkIn = timestampToDate(checkInTime);
    const diff = Math.floor((now.getTime() - checkIn.getTime()) / 1000 / 60);
    return `${diff} mins`;
  },

  async getPatientById(patientId: string): Promise<Patient> {
    try {
      const response = await axios.get(`${API_BASE_URL}/patients/${patientId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "fetching patient");
    }
  },

  async getPatientDashboardData() {
    try {
      const response = await axios.get(`${API_BASE_URL}/patients/dashboard`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "fetching dashboard data");
    }
  },

  async getAllReports(): Promise<PatientReport[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "fetching reports");
    }
  },

  async sendPatientReport(reportData: PatientReport): Promise<boolean> {
    try {
      await axios.post(`${API_BASE_URL}/reports`, reportData);
      return true;
    } catch (error) {
      return handleApiError(error, "sending patient report");
    }
  },

  async getPatientReports(patientId: string): Promise<PatientReport[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/patients/${patientId}/reports`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "fetching patient reports");
    }
  },

  async getReportById(reportId: string): Promise<PatientReport> {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/${reportId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "fetching report");
    }
  },

  async sendMessageToReport(reportId: string, message: string, sender: 'patient' | 'doctor'): Promise<boolean> {
    try {
      await axios.post(`${API_BASE_URL}/reports/${reportId}/messages`, {
        message,
        sender
      });
      return true;
    } catch (error) {
      return handleApiError(error, "sending message");
    }
  },

  async getReportsWithUnreadMessages(): Promise<PatientReport[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/unread`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "fetching unread reports");
    }
  },

  async updateReportMessages(reportId: string, messages: any[]): Promise<boolean> {
    try {
      await axios.put(`${API_BASE_URL}/reports/${reportId}/messages`, { messages });
      return true;
    } catch (error) {
      return handleApiError(error, "updating report messages");
    }
  },

  async getPatientProfile(): Promise<PatientProfileData> {
    try {
      const response = await axios.get(`${API_BASE_URL}/patients/profile`);
      return response.data;
    } catch (error) {
      return handleApiError(error, "fetching patient profile");
    }
  },

  async updateProfile(profile: PatientProfileData): Promise<void> {
    try {
      await axios.put(`${API_BASE_URL}/patients/profile`, profile);
    } catch (error) {
      return handleApiError(error, "updating profile");
    }
  },

  async getCurrentUserId(): Promise<string> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/current-user`);
      return response.data.userId;
    } catch (error) {
      return handleApiError(error, "getting current user");
    }
  },

  async registerPatient(patientData: { name: string; email: string; phone: string; }): Promise<string> {
    try {
      const response = await axios.post(`${API_BASE_URL}/patients`, patientData);
      return response.data.id;
    } catch (error) {
      return handleApiError(error, "registering patient");
    }
  },

  async deletePatient(patientId: string): Promise<boolean> {
    try {
      await axios.delete(`${API_BASE_URL}/patients/${patientId}`);
      return true;
    } catch (error) {
      return handleApiError(error, "deleting patient");
    }
  },

  async updatePatient(patientId: string, patientData: Partial<Patient>): Promise<Patient> {
    try {
      const response = await axios.put(`${API_BASE_URL}/patients/${patientId}`, patientData);
      return response.data;
    } catch (error) {
      return handleApiError(error, "updating patient");
    }
  }
};

export default PatientService;
