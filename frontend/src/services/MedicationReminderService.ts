import axios from 'axios';

const API_URL = 'http://localhost:8000/api/reminders';

export interface MedicationReminderRequest {
  patient_id: string;
  patient_name: string;
  message: string;
  medicine: string;
}

export interface PrescriptionDetails {
  medicine_name: string;
  dosage: string;
  usage: string;
  diagnosis: string;
  additional_notes?: string;
  next_appointment?: string;
  duration_days: number;
}

export interface MedicationSchedule {
  patient_id: string;
  medicine_id: string;
  schedule: string;
  start_date: string;
  end_date: string;
  notes?: string;
}

export interface ReminderResponse {
  id: string;
  status: string;
  message: string;
}

export interface AgentConversationRequest {
  patient_id: string;
  patient_name: string;
  message: string;
  medicine: string;
  prescription_details: PrescriptionDetails;
}

export interface ConversationResponse {
  conversation_id: string;
  status: string;
  message: string;
}

const MedicationReminderService = {
  /**
   * Process a patient message through the AI assistant
   */
  processPatientMessage: async (data: MedicationReminderRequest): Promise<{reply: string}> => {
    try {
      const response = await axios.post(`${API_URL}/patient-message`, data);
      return response.data;
    } catch (error) {
      console.error('Error processing patient message:', error);
      throw error;
    }
  },

  /**
   * Schedule a medication reminder
   */
  scheduleReminder: async (data: MedicationSchedule): Promise<{message: string, data: ReminderResponse}> => {
    try {
      const response = await axios.post(`${API_URL}/schedule`, data);
      return response.data;
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      throw error;
    }
  },

  /**
   * Initiate a conversation with an intelligent agent
   */
  initiateAgentConversation: async (data: AgentConversationRequest): Promise<ConversationResponse> => {
    try {
      const response = await axios.post(`${API_URL}/agent/initiate`, data);
      return response.data;
    } catch (error) {
      console.error('Error initiating agent conversation:', error);
      throw error;
    }
  },

  /**
   * Get all active conversations for a patient
   */
  getPatientConversations: async (patientId: string): Promise<any[]> => {
    try {
      const response = await axios.get(`${API_URL}/agent/conversations/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting patient conversations:', error);
      throw error;
    }
  },

  /**
   * Get conversation history
   */
  getConversationHistory: async (conversationId: string): Promise<any[]> => {
    try {
      const response = await axios.get(`${API_URL}/agent/history/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting conversation history:', error);
      throw error;
    }
  }
};

export default MedicationReminderService; 