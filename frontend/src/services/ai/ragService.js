import { api } from '../../utils/api';

export const DermatologyRAG = {
  // Query both medical knowledge base and clinic services
  async queryKnowledge(query, context = {}) {
    try {
      const response = await api.post('/api/rag/query', {
        query,
        context: {
          clinic_services: context.clinicServices || [],
          patient_history: context.patientHistory || null,
          search_type: context.searchType || 'all'
        }
      });
      return response.data;
    } catch (error) {
      console.error('RAG Query Error:', error);
      throw error;
    }
  },

  // Specifically search clinic services
  async searchClinicServices(query) {
    try {
      const response = await api.post('/api/rag/services', {
        query,
        type: 'clinic_services'
      });
      return response.data;
    } catch (error) {
      console.error('Service Search Error:', error);
      throw error;
    }
  },

  // Search medical literature
  async searchMedicalLiterature(query) {
    try {
      const response = await api.post('/api/rag/medical', {
        query,
        type: 'medical_literature'
      });
      return response.data;
    } catch (error) {
      console.error('Medical Search Error:', error);
      throw error;
    }
  }
}; 