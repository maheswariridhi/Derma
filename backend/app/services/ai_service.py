import os
import logging
from typing import Dict, Any, Optional
from anthropic import Anthropic
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        try:
            # Initialize Anthropic client
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if not api_key:
                raise ValueError("Missing Anthropic API key. Check environment variables.")
            
            self.client = Anthropic(api_key=api_key)
            logger.info("Anthropic client initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing Anthropic client: {str(e)}")
            raise e

    async def generate_treatment_explanation(self, treatment_data: Dict[str, Any]) -> str:
        """Generate educational content for a treatment."""
        try:
            prompt = f"""
            You are a medical assistant helping patients understand their treatments. 
            Please provide a clear, patient-friendly explanation of the following treatment:
            
            Treatment Name: {treatment_data.get('name', 'Unknown')}
            Description: {treatment_data.get('description', 'No description available')}
            Duration: {treatment_data.get('duration', 'Unknown')} days
            Category: {treatment_data.get('category', 'General')}
            
            Please provide an explanation that includes:
            1. What this treatment does in simple terms
            2. What to expect during the treatment
            3. Any important things to know before, during, or after
            4. How long it typically takes to see results
            5. Any side effects or considerations
            
            Keep the language simple and avoid medical jargon. Write in a warm, supportive tone.
            Limit the response to 2-3 paragraphs maximum.
            """
            
            response = self.client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=500,
                temperature=0.7,
                system="You are a helpful medical assistant that explains treatments in simple, patient-friendly language.",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            explanation = response.content[0].text.strip()
            logger.info(f"Generated treatment explanation for {treatment_data.get('name')}")
            return explanation
            
        except Exception as e:
            logger.error(f"Error generating treatment explanation: {str(e)}")
            return "We're sorry, but we couldn't generate an explanation for this treatment at the moment. Please consult with your healthcare provider for more information."

    async def generate_medicine_explanation(self, medicine_data: Dict[str, Any]) -> str:
        """Generate educational content for a medicine."""
        try:
            prompt = f"""
            You are a medical assistant helping patients understand their medications. 
            Please provide a clear, patient-friendly explanation of the following medication:
            
            Medication Name: {medicine_data.get('name', 'Unknown')}
            Description: {medicine_data.get('description', 'No description available')}
            Dosage: {medicine_data.get('dosage', 'As prescribed')}
            Unit: {medicine_data.get('unit', 'Unknown')}
            
            Please provide an explanation that includes:
            1. What this medication does in simple terms
            2. How to take it properly
            3. What to expect when taking it
            4. Important things to remember (like taking with food, avoiding certain activities, etc.)
            5. Any common side effects to watch for
            6. When to contact your doctor
            
            Keep the language simple and avoid medical jargon. Write in a warm, supportive tone.
            Limit the response to 2-3 paragraphs maximum.
            """
            
            response = self.client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=500,
                temperature=0.7,
                system="You are a helpful medical assistant that explains medications in simple, patient-friendly language.",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            explanation = response.content[0].text.strip()
            logger.info(f"Generated medicine explanation for {medicine_data.get('name')}")
            return explanation
            
        except Exception as e:
            logger.error(f"Error generating medicine explanation: {str(e)}")
            return "We're sorry, but we couldn't generate an explanation for this medication at the moment. Please consult with your healthcare provider for more information." 