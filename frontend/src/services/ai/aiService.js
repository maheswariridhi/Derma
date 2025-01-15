import { api } from '../../utils/api';

export const getAIRecommendations = async (patientData) => {
  try {
    const response = await api.post('/api/ai/recommendations', {
      patient_name: patientData.name,
      age: patientData.age,
      condition: patientData.condition,
      symptoms: patientData.symptoms,
      previous_treatments: patientData.previousTreatments,
      last_visit: patientData.lastVisit,
      allergies: patientData.allergies || [],
      current_medications: patientData.currentMedications || []
    });
    return response.data;
  } catch (error) {
    console.error('AI Service Error:', error);
    throw error;
  }
}; 