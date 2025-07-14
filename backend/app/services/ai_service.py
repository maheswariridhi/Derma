import os
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
import httpx

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIService:
    def __init__(self, vector_db_service, anthropic_api_key: str):
        self.vector_db = vector_db_service
        self.anthropic_api_key = anthropic_api_key
        logging.info("AIService initialized with real vector DB and Anthropic integration (Claude API key set: %s)" % bool(anthropic_api_key))

    async def generate_treatment_explanation(self, treatment_data: Dict[str, Any]) -> str:
        """Generate educational content for a treatment."""
        try:
            name = treatment_data.get('name', 'Unknown')
            description = treatment_data.get('description', 'No description available')
            duration = treatment_data.get('duration', 'Unknown')
            category = treatment_data.get('category', 'General')
            
            explanation = f"""
            {name} is a {category.lower()} treatment that helps with various skin conditions.
            
            What it does: {description}
            
            Duration: This treatment typically takes {duration} days to complete.
            
            What to expect: You may experience some mild discomfort during the procedure, but it's generally well-tolerated. Results may take a few weeks to become noticeable.
            
            Important notes: Always follow your doctor's instructions and keep the treated area clean. Contact your healthcare provider if you experience any unusual side effects.
            """
            
            logger.info(f"Generated treatment explanation for {name}")
            return explanation.strip()
            
        except Exception as e:
            logger.error(f"Error generating treatment explanation: {str(e)}")
            return "We're sorry, but we couldn't generate an explanation for this treatment at the moment. Please consult with your healthcare provider for more information."

    async def generate_medicine_explanation(self, medicine_data: Dict[str, Any]) -> str:
        """Generate educational content for a medicine."""
        try:
            name = medicine_data.get('name', 'Unknown')
            description = medicine_data.get('description', 'No description available')
            dosage = medicine_data.get('dosage', 'As prescribed')
            unit = medicine_data.get('unit', 'Unknown')
            
            explanation = f"""
            {name} is a medication used to treat various skin conditions.
            
            What it does: {description}
            
            How to take it: {dosage} {unit} as prescribed by your doctor.
            
            Important instructions: Take this medication exactly as prescribed. Do not skip doses or stop taking it without consulting your doctor. Store it in a cool, dry place away from children.
            
            Side effects: Common side effects may include mild skin irritation, redness, or dryness. Contact your doctor if you experience severe reactions or if symptoms worsen.
            """
            
            logger.info(f"Generated medicine explanation for {name}")
            return explanation.strip()
            
        except Exception as e:
            logger.error(f"Error generating medicine explanation: {str(e)}")
            return "We're sorry, but we couldn't generate an explanation for this medication at the moment. Please consult with your healthcare provider for more information."

    async def add_medical_document(self, content: str, metadata: Dict[str, Any]) -> str:
        """Add a medical document to the vector database for later retrieval."""
        try:
            return await self.vector_db.add_document(content, metadata)
        except Exception as e:
            logger.error(f"Error adding medical document: {str(e)}")
            raise e

    async def chat_with_medical_context(self, 
                                       user_message: str, 
                                       user_id: str, 
                                       session_id: Optional[str] = None,
                                       patient_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Chat with medical context using vector database retrieval."""
        try:
            # 1. Retrieve relevant docs from vector DB
            docs = await self.vector_db.search_documents(user_message)
            # 2. Retrieve chat history
            history = await self.vector_db.get_chat_history(user_id, session_id)
            # 3. Call Anthropic Claude API with context (stubbed for now)
            response = await self._call_anthropic(user_message, docs, history)
            # 4. Store chat in vector DB
            await self.vector_db.add_chat_message(user_id, user_message, response, session_id)
            return {"response": response, "relevant_documents": docs, "session_id": session_id, "timestamp": datetime.now().isoformat()}
            
        except Exception as e:
            logger.error(f"Error in chat_with_medical_context: {str(e)}")
            return {
                "response": "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact your healthcare provider for immediate assistance.",
                "error": str(e)
            }

    async def _call_anthropic(self, user_message, docs, history):
        # This is a stub. Replace with real Anthropic Claude API call.
        # Example: Use httpx to POST to Anthropic endpoint with your API key and context.
        # For now, just echo the message and docs.
        context = "\n".join([doc['content'] for doc in docs])
        return f"[AI] You said: {user_message}\nRelevant context: {context[:200]}..."

    async def analyze_medical_document(self, document_content: str, document_type: str = "report") -> Dict[str, Any]:
        """Analyze a medical document and extract key information."""
        try:
            # Mock analysis
            analysis = {
                "key_findings": ["Sample finding 1", "Sample finding 2"],
                "medical_terms": {
                    "dermatitis": "Inflammation of the skin",
                    "erythema": "Redness of the skin"
                },
                "recommendations": ["Follow up in 2 weeks", "Continue current treatment"],
                "urgent_items": [],
                "patient_summary": "This appears to be a routine medical report. Please consult with your healthcare provider for detailed interpretation.",
                "confidence_level": "Medium"
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing medical document: {str(e)}")
            return {
                "key_findings": [],
                "medical_terms": {},
                "recommendations": ["Please consult with your healthcare provider"],
                "urgent_items": [],
                "patient_summary": "Unable to analyze document at this time.",
                "confidence_level": "Low"
            }

    async def get_vector_db_stats(self) -> Dict[str, Any]:
        """Get vector database statistics."""
        try:
            return await self.vector_db.get_collection_stats()
        except Exception as e:
            logger.error(f"Error getting vector DB stats: {str(e)}")
            return {"error": str(e)} 