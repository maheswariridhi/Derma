import { api } from '../../utils/api';

export const updateAIServiceDatabase = async (servicesData) => {
  try {
    const response = await api.post('/api/ai/update-services', servicesData);
    return response.data;
  } catch (error) {
    console.error('Error updating AI service database:', error);
    throw error;
  }
};

export const getServiceSuggestions = async (serviceType, query) => {
  try {
    const response = await api.post('/api/ai/suggest-services', {
      type: serviceType,
      query
    });
    return response.data;
  } catch (error) {
    console.error('Error getting service suggestions:', error);
    throw error;
  }
}; 