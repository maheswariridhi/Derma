import { Timestamp } from '../types/common';
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api"; // FastAPI backend URL with /api prefix

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
      console.error("Error fetching patients:", error);
      throw new Error(`Failed to fetch patients: ${(error as Error).message}`);
    }
  },

  async getQueuePatients(): Promise<QueueEntry[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/queue/patients`);
      return response.data;
    } catch (error) {
      console.error("Detailed queue error:", error);
      throw new Error(`Failed to fetch queue: ${(error as Error).message}`);
    }
  },

  async updatePatientStatus(patientId: string, newStatus: string): Promise<boolean> {
    try {
      await axios.put(`${API_BASE_URL}/patients/${patientId}/status`, { status: newStatus });
      return true;
    } catch (error) {
      console.error("Error updating patient status:", error);
      throw new Error(`Failed to update patient status: ${(error as Error).message}`);
    }
  },

  async prioritizePatient(patientId: string): Promise<boolean> {
    try {
      await axios.put(`${API_BASE_URL}/patients/${patientId}/priority`);
      return true;
    } catch (error) {
      console.error("Error prioritizing patient:", error);
      throw new Error(`Failed to prioritize patient: ${(error as Error).message}`);
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
      console.error("Error checking in patient:", error);
      throw new Error(`Failed to check in patient: ${(error as Error).message}`);
    }
  },

  async getQueueStatus(): Promise<Record<string, QueueEntry[]>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/queue/status`);
      return response.data;
    } catch (error) {
      console.error("Error getting queue status:", error);
      throw new Error(`Failed to get queue status: ${(error as Error).message}`);
    }
  },

  async updateQueueStatus(queueId: string, newStatus: string): Promise<void> {
    try {
      await axios.put(`${API_BASE_URL}/queue/${queueId}/status`, { status: newStatus });
    } catch (error) {
      console.error("Error updating queue status:", error);
      throw new Error(`Failed to update queue status: ${(error as Error).message}`);
    }
  },

  calculateWaitingTime(checkInTime?: Timestamp): string {
    if (!checkInTime) return "N/A";
    const now = new Date();
    const checkIn = checkInTime.toDate();
    const diff = Math.floor((now.getTime() - checkIn.getTime()) / 1000 / 60);
    return `${diff} mins`;
  },

  async getPatientById(patientId: string): Promise<Patient> {
    try {
      const response = await axios.get(`${API_BASE_URL}/patients/${patientId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching patient:", error);
      throw new Error(`Failed to fetch patient: ${(error as Error).message}`);
    }
  },

  async getPatientDashboardData() {
    try {
      const response = await axios.get(`${API_BASE_URL}/patients/dashboard`);
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw new Error(`Failed to fetch dashboard data: ${(error as Error).message}`);
    }
  },

  async getAllReports(): Promise<PatientReport[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports`);
      return response.data;
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw new Error(`Failed to fetch reports: ${(error as Error).message}`);
    }
  },

  async sendPatientReport(reportData: PatientReport): Promise<boolean> {
    try {
      await axios.post(`${API_BASE_URL}/reports`, reportData);
      return true;
    } catch (error) {
      console.error("Error sending patient report:", error);
      throw new Error(`Failed to send patient report: ${(error as Error).message}`);
    }
  },

  async getPatientReports(patientId: string): Promise<PatientReport[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/patients/${patientId}/reports`);
      return response.data;
    } catch (error) {
      console.error("Error fetching patient reports:", error);
      throw new Error(`Failed to fetch patient reports: ${(error as Error).message}`);
    }
  },

  async getReportById(reportId: string): Promise<PatientReport> {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching report:", error);
      throw new Error(`Failed to fetch report: ${(error as Error).message}`);
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
      console.error("Error sending message:", error);
      throw new Error(`Failed to send message: ${(error as Error).message}`);
    }
  },

  async getReportsWithUnreadMessages(): Promise<PatientReport[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/unread`);
      return response.data;
    } catch (error) {
      console.error("Error fetching unread reports:", error);
      throw new Error(`Failed to fetch unread reports: ${(error as Error).message}`);
    }
  },

  async updateReportMessages(reportId: string, messages: any[]): Promise<boolean> {
    try {
      await axios.put(`${API_BASE_URL}/reports/${reportId}/messages`, { messages });
      return true;
    } catch (error) {
      console.error("Error updating report messages:", error);
      throw new Error(`Failed to update report messages: ${(error as Error).message}`);
    }
  },

  async getPatientProfile(): Promise<PatientProfileData> {
    try {
      const response = await axios.get(`${API_BASE_URL}/patients/profile`);
      return response.data;
    } catch (error) {
      console.error("Error fetching patient profile:", error);
      throw new Error(`Failed to fetch patient profile: ${(error as Error).message}`);
    }
  },

  async updateProfile(profile: PatientProfileData): Promise<void> {
    try {
      await axios.put(`${API_BASE_URL}/patients/profile`, profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw new Error(`Failed to update profile: ${(error as Error).message}`);
    }
  },

  async getCurrentUserId(): Promise<string> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/current-user`);
      return response.data.userId;
    } catch (error) {
      console.error("Error getting current user:", error);
      throw new Error(`Failed to get current user: ${(error as Error).message}`);
    }
  },

  async registerPatient(patientData: { name: string; email: string; phone: string; }): Promise<string> {
    try {
      const response = await axios.post(`${API_BASE_URL}/patients/register`, patientData);
      return response.data.id;
    } catch (error) {
      console.error("Error registering patient:", error);
      throw new Error(`Failed to register patient: ${(error as Error).message}`);
    }
  },

  async deletePatient(patientId: string): Promise<boolean> {
    try {
      await axios.delete(`${API_BASE_URL}/patients/${patientId}`);
      return true;
    } catch (error) {
      console.error("Error deleting patient:", error);
      throw new Error(`Failed to delete patient: ${(error as Error).message}`);
    }
  },

  async updatePatient(patientId: string, patientData: Partial<Patient>): Promise<Patient> {
    try {
      const response = await axios.put(`${API_BASE_URL}/patients/${patientId}`, patientData);
      return response.data;
    } catch (error) {
      console.error("Error updating patient:", error);
      throw new Error(`Failed to update patient: ${(error as Error).message}`);
    }
  }
};

export default PatientService;
