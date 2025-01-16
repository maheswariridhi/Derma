import { api } from '../../utils/api';

export const DermatologyAgent = {
  // Appointment Management
  async scheduleAppointment(patientData, preferredTime) {
    try {
      const response = await api.post('/api/agent/schedule', {
        patient: patientData,
        preferred_time: preferredTime,
        action: 'schedule_appointment'
      });
      return response.data;
    } catch (error) {
      console.error('Agent Scheduling Error:', error);
      throw error;
    }
  },

  // Follow-up Management
  async handleFollowUp(patientData) {
    try {
      const response = await api.post('/api/agent/follow-up', {
        patient: patientData,
        action: 'follow_up'
      });
      return response.data;
    } catch (error) {
      console.error('Agent Follow-up Error:', error);
      throw error;
    }
  },

  // Treatment Plan Management
  async manageTreatmentPlan(patientData, currentPlan) {
    try {
      const response = await api.post('/api/agent/treatment-plan', {
        patient: patientData,
        current_plan: currentPlan,
        action: 'manage_treatment'
      });
      return response.data;
    } catch (error) {
      console.error('Agent Treatment Plan Error:', error);
      throw error;
    }
  }
}; 