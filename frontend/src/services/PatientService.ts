import axios from "axios";
import { TreatmentPlan, Patient, PatientFilters, PatientReport } from "../types/patients";

const API_BASE_URL = "http://localhost:8000/api"; // FastAPI backend URL with /api prefix

// Add Axios interceptor to attach token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Utility function for handling API errors
const handleApiError = (error: any, operation: string): never => {
  console.error(`Error ${operation}:`, error);
  if (axios.isAxiosError(error)) {
    console.error(`API Error Status: ${error.response?.status}`);
  }
  throw new Error(`Failed to ${operation}: ${(error as Error).message}`);
};

// Transform treatment plan for API
const transformTreatmentPlanForApi = (plan: TreatmentPlan) => ({
  ...plan,
  medications: plan.selectedMedicines.map(med => ({
    name: med.name,
    dosage: med.dosage,
    timeToTake: med.timeToTake,
    durationDays: med.durationDays
  }))
});

// Define QueueEntry interface
interface QueueEntry {
  id: string;
  patientId: string;
  queueType: string;
  tokenNumber: number;
  status: string;
  date: string;
  checkInTime: string;
  estimatedWaitTime?: number;
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

  async sendPatientReport(reportData: TreatmentPlan): Promise<boolean> {
    try {
      const transformedData = transformTreatmentPlanForApi(reportData);
      await axios.post(`${API_BASE_URL}/reports`, transformedData);
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
