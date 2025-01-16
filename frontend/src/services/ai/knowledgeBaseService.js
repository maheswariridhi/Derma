import { api } from '../../utils/api';

export const DermatologyKnowledgeBase = {
  async searchKnowledge(query) {
    try {
      const response = await api.post('/api/knowledge/search', {
        query,
        type: 'dermatology'
      });
      return response.data;
    } catch (error) {
      console.error('Knowledge Base Error:', error);
      throw error;
    }
  },

  async getConditionInfo(condition) {
    try {
      const response = await api.get(`/api/knowledge/conditions/${condition}`);
      return response.data;
    } catch (error) {
      console.error('Condition Info Error:', error);
      throw error;
    }
  },

  async getTreatmentGuidelines(treatment) {
    try {
      const response = await api.get(`/api/knowledge/treatments/${treatment}`);
      return response.data;
    } catch (error) {
      console.error('Treatment Guidelines Error:', error);
      throw error;
    }
  }
}; 