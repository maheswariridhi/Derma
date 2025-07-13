import os
import logging
import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import json

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VectorDBService:
    def __init__(self):
        try:
            # Initialize ChromaDB client
            self.client = chromadb.PersistentClient(
                path="./chroma_db",
                settings=Settings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )
            
            # Initialize sentence transformer for embeddings
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Get or create collections
            self.documents_collection = self.client.get_or_create_collection(
                name="medical_documents",
                metadata={"description": "Medical documents and reports"}
            )
            
            self.chat_history_collection = self.client.get_or_create_collection(
                name="chat_history",
                metadata={"description": "Chat conversation history"}
            )
            
            logger.info("VectorDBService initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing VectorDBService: {str(e)}")
            raise e

    def _generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text using sentence transformer."""
        try:
            embedding = self.embedding_model.encode(text)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            raise e

    async def add_document(self, 
                          content: str, 
                          metadata: Dict[str, Any], 
                          document_type: str = "medical_document") -> str:
        """Add a document to the vector database."""
        try:
            # Generate unique ID
            doc_id = str(uuid.uuid4())
            
            # Generate embedding
            embedding = self._generate_embedding(content)
            
            # Prepare metadata
            doc_metadata = {
                **metadata,
                "document_type": document_type,
                "created_at": datetime.now().isoformat(),
                "content_length": len(content)
            }
            
            # Add to collection
            self.documents_collection.add(
                embeddings=[embedding],
                documents=[content],
                metadatas=[doc_metadata],
                ids=[doc_id]
            )
            
            logger.info(f"Document added successfully with ID: {doc_id}")
            return doc_id
            
        except Exception as e:
            logger.error(f"Error adding document: {str(e)}")
            raise e

    async def search_documents(self, 
                              query: str, 
                              n_results: int = 5, 
                              filter_metadata: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Search for relevant documents based on query."""
        try:
            # Generate query embedding
            query_embedding = self._generate_embedding(query)
            
            # Search in collection
            results = self.documents_collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=filter_metadata
            )
            
            # Format results
            formatted_results = []
            for i in range(len(results['ids'][0])):
                formatted_results.append({
                    'id': results['ids'][0][i],
                    'content': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i],
                    'distance': results['distances'][0][i] if 'distances' in results else None
                })
            
            logger.info(f"Found {len(formatted_results)} relevant documents")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching documents: {str(e)}")
            raise e

    async def add_chat_message(self, 
                              user_id: str, 
                              message: str, 
                              response: str, 
                              session_id: Optional[str] = None) -> str:
        """Add a chat message to the conversation history."""
        try:
            # Generate unique ID
            message_id = str(uuid.uuid4())
            
            # Combine message and response for embedding
            combined_text = f"User: {message}\nAssistant: {response}"
            embedding = self._generate_embedding(combined_text)
            
            # Prepare metadata
            metadata = {
                "user_id": user_id,
                "session_id": session_id or str(uuid.uuid4()),
                "message": message,
                "response": response,
                "created_at": datetime.now().isoformat(),
                "message_type": "chat"
            }
            
            # Add to chat history collection
            self.chat_history_collection.add(
                embeddings=[embedding],
                documents=[combined_text],
                metadatas=[metadata],
                ids=[message_id]
            )
            
            logger.info(f"Chat message added successfully with ID: {message_id}")
            return message_id
            
        except Exception as e:
            logger.error(f"Error adding chat message: {str(e)}")
            raise e

    async def get_chat_history(self, 
                              user_id: str, 
                              session_id: Optional[str] = None, 
                              limit: int = 10) -> List[Dict[str, Any]]:
        """Get chat history for a user or session."""
        try:
            # Build filter
            where_filter = {"user_id": user_id}
            if session_id:
                where_filter["session_id"] = session_id
            
            # Get chat history
            results = self.chat_history_collection.get(
                where=where_filter,
                limit=limit
            )
            
            # Format results
            formatted_results = []
            for i in range(len(results['ids'])):
                formatted_results.append({
                    'id': results['ids'][i],
                    'metadata': results['metadatas'][i],
                    'content': results['documents'][i]
                })
            
            # Sort by creation time (newest first)
            formatted_results.sort(key=lambda x: x['metadata']['created_at'], reverse=True)
            
            logger.info(f"Retrieved {len(formatted_results)} chat messages")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error getting chat history: {str(e)}")
            raise e

    async def delete_document(self, document_id: str) -> bool:
        """Delete a document from the vector database."""
        try:
            self.documents_collection.delete(ids=[document_id])
            logger.info(f"Document deleted successfully: {document_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting document: {str(e)}")
            return False

    async def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific document by ID."""
        try:
            results = self.documents_collection.get(ids=[document_id])
            
            if not results['ids']:
                return None
            
            return {
                'id': results['ids'][0],
                'content': results['documents'][0],
                'metadata': results['metadatas'][0]
            }
            
        except Exception as e:
            logger.error(f"Error getting document: {str(e)}")
            return None

    async def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the collections."""
        try:
            doc_count = self.documents_collection.count()
            chat_count = self.chat_history_collection.count()
            
            return {
                "documents_count": doc_count,
                "chat_messages_count": chat_count,
                "total_items": doc_count + chat_count
            }
            
        except Exception as e:
            logger.error(f"Error getting collection stats: {str(e)}")
            return {"error": str(e)} 