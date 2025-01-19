from typing import List, Dict, Any
from datetime import datetime
from langchain_community.document_loaders import (
    TextLoader,
    JSONLoader,
    UnstructuredPDFLoader as PDFLoader
)
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from app.services.rag.medical_knowledge import MockEmbeddings

class KnowledgeManager:
    def __init__(self, medical_knowledge: Chroma, mock_mode=True):
        self.medical_knowledge = medical_knowledge
        self.mock_mode = mock_mode
        if mock_mode:
            self.embeddings = MockEmbeddings()
        else:
            self.embeddings = OpenAIEmbeddings()
        
    async def store_case(
        self,
        recommendation_id: str,
        patient_data: Dict[str, Any],
        enhanced_results: Dict[str, Any],
        violations: List[str]
    ):
        """Store case information in the knowledge base"""
        if self.mock_mode:
            return {"status": "success", "id": recommendation_id}

        case_data = {
            "id": recommendation_id,
            "timestamp": datetime.now().isoformat(),
            "patient_data": patient_data,
            "results": enhanced_results,
            "violations": violations
        }
        
        # Store in vector database
        texts = [str(case_data)]
        embeddings = self.embeddings.embed_documents(texts)
        
        self.medical_knowledge.add_documents(
            documents=texts,
            embeddings=embeddings,
            metadatas=[{"type": "case_history", "id": recommendation_id}]
        )
        
        return {"status": "success", "id": recommendation_id}

    async def load_documents(self, file_paths: List[str]):
        """Load documents into the knowledge base"""
        if self.mock_mode:
            return {"status": "success", "message": "Mock document loading"}

        documents = []
        for path in file_paths:
            if path.endswith('.txt'):
                loader = TextLoader(path)
            elif path.endswith('.json'):
                loader = JSONLoader(path)
            elif path.endswith('.pdf'):
                loader = PDFLoader(path)
            else:
                continue
                
            documents.extend(loader.load())
            
        return {"status": "success", "count": len(documents)} 