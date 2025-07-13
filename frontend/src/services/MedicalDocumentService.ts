import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export interface MedicalDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface DocumentAnalysis {
  key_findings: string[];
  medical_terms: Record<string, string>;
  recommendations: string[];
  urgent_items: string[];
  patient_summary: string;
  confidence_level: 'High' | 'Medium' | 'Low';
}

export interface ChatMessage {
  message: string;
  response: string;
  timestamp: string;
  session_id?: string;
}

export interface ChatRequest {
  message: string;
  user_id: string;
  session_id?: string;
  patient_id?: string;
}

export interface ChatResponse {
  response: string;
  relevant_documents: number;
  session_id?: string;
  timestamp: string;
}

const MedicalDocumentService = {
  /**
   * Add a medical document to the vector database
   */
  addDocument: async (content: string, metadata?: Record<string, any>): Promise<{ document_id: string }> => {
    try {
      const response = await axios.post(`${API_URL}/documents`, {
        content,
        metadata
      });
      return response.data;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  },

  /**
   * Search for medical documents
   */
  searchDocuments: async (query: string, nResults: number = 5): Promise<{
    query: string;
    results: any[];
    total_found: number;
  }> => {
    try {
      const response = await axios.get(`${API_URL}/documents/search`, {
        params: { query, n_results: nResults }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  },

  /**
   * Analyze a medical document
   */
  analyzeDocument: async (content: string, documentType: string = 'report'): Promise<{
    analysis: DocumentAnalysis;
    document_type: string;
    timestamp: string;
  }> => {
    try {
      const response = await axios.post(`${API_URL}/documents/analyze`, {
        content,
        document_type: documentType
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw error;
    }
  },

  /**
   * Delete a medical document
   */
  deleteDocument: async (documentId: string): Promise<{ status: string; message: string }> => {
    try {
      const response = await axios.delete(`${API_URL}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  /**
   * Upload a medical document file
   */
  uploadDocument: async (
    file: File,
    patientId?: string,
    doctorId?: string,
    documentType: string = 'medical_document'
  ): Promise<{ document_id: string; filename: string; status: string; message: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (patientId) formData.append('patient_id', patientId);
      if (doctorId) formData.append('doctor_id', doctorId);
      formData.append('document_type', documentType);

      const response = await axios.post(`${API_URL}/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  /**
   * Chat with medical assistant
   */
  chat: async (request: ChatRequest): Promise<ChatResponse> => {
    try {
      const response = await axios.post(`${API_URL}/chat`, request);
      return response.data;
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  },

  /**
   * Get chat history for a user
   */
  getChatHistory: async (
    userId: string,
    sessionId?: string,
    limit: number = 10
  ): Promise<{
    user_id: string;
    session_id?: string;
    history: any[];
    total_messages: number;
  }> => {
    try {
      const response = await axios.get(`${API_URL}/chat/history/${userId}`, {
        params: { session_id: sessionId, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  },

  /**
   * Get vector database statistics
   */
  getVectorDBStats: async (): Promise<{
    documents_count: number;
    chat_messages_count: number;
    total_items: number;
  }> => {
    try {
      const response = await axios.get(`${API_URL}/vector-db/stats`);
      return response.data;
    } catch (error) {
      console.error('Error getting vector DB stats:', error);
      throw error;
    }
  },

  /**
   * Health check with vector database status
   */
  healthCheck: async (): Promise<{
    status: string;
    services: Record<string, string>;
    vector_db_stats?: any;
  }> => {
    try {
      const response = await axios.get(`${API_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('Error in health check:', error);
      throw error;
    }
  }
};

export default MedicalDocumentService; 