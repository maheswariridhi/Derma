from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
import os
from typing import List, Optional
from mock_handler import MockHandler


class MedicalKnowledgeRAG:
    def __init__(self):
        try:
            self.embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))
        except Exception as e:
            print(f"Warning: Using mock embeddings - {str(e)}")
            self.embeddings = self._get_mock_embeddings()
        
        self.vectorstore = Chroma(
            collection_name="medical_knowledge",
            embedding_function=self.embeddings,
            persist_directory="./data/chroma"  # Added persist directory
        )

    async def query(self, symptoms: List[str], medical_history: Optional[str] = None) -> str:
        # Construct query from symptoms and history
        query = f"Symptoms: {', '.join(symptoms)}"
        if medical_history:
            query += f"\nMedical History: {medical_history}"
        
        try:
            # Get relevant medical documents
            docs = self.vectorstore.similarity_search(query, k=3)
            return "\n".join([doc.page_content for doc in docs])
        except Exception as e:
            print(f"Warning: Using mock response - {str(e)}")
            return MockHandler.get_mock_response()  # Correctly placed MockHandler call

    def _get_mock_embeddings(self):
        return lambda x: [0.0] * 1536  # OpenAI embedding dimension
