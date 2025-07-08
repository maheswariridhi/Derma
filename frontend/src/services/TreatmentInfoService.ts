import axios from 'axios';

const API_URL = 'http://localhost:8000/api/treatment-info';

export interface TreatmentInfo {
  id: string;
  item_type: 'treatment' | 'medicine';
  item_id: string;
  item_name: string;
  explanation: string;
  created_at: string;
  updated_at: string;
}

export interface TreatmentInfoRequest {
  item_type: 'treatment' | 'medicine';
  item_id: string;
}

const TreatmentInfoService = {
  /**
   * Get educational content for a treatment or medicine
   */
  getTreatmentInfo: async (itemType: 'treatment' | 'medicine', itemId: string): Promise<TreatmentInfo> => {
    try {
      const response = await axios.get(`${API_URL}/${itemType}/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting treatment info:', error);
      throw error;
    }
  },

  /**
   * Generate educational content for a treatment or medicine
   */
  generateTreatmentInfo: async (request: TreatmentInfoRequest): Promise<TreatmentInfo> => {
    try {
      const response = await axios.post(`${API_URL}/generate`, request);
      return response.data;
    } catch (error) {
      console.error('Error generating treatment info:', error);
      throw error;
    }
  },

  /**
   * Get or generate educational content for multiple items
   */
  getMultipleTreatmentInfo: async (items: Array<{ type: 'treatment' | 'medicine', id: string }>): Promise<TreatmentInfo[]> => {
    try {
      const promises = items.map(item => 
        this.getTreatmentInfo(item.type, item.id).catch(() => 
          this.generateTreatmentInfo({ item_type: item.type, item_id: item.id })
        )
      );
      
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Error getting multiple treatment info:', error);
      throw error;
    }
  }
};

export default TreatmentInfoService; 