import openai
from app.models.ai_models import PatientHistory, AIRecommendationResponse
import json
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

class DermatologyAIService:
    @staticmethod
    def create_prompt(patient_data: PatientHistory) -> str:
        return f"""As a dermatology specialist AI, analyze the following patient data and provide comprehensive recommendations:

Patient Information:
- Name: {patient_data.patient_name}
- Age: {patient_data.age}
- Condition: {patient_data.condition}
- Current Symptoms: {', '.join(patient_data.symptoms)}
- Previous Treatments: {', '.join(patient_data.previous_treatments)}
- Last Visit: {patient_data.last_visit}
- Allergies: {', '.join(patient_data.allergies) if patient_data.allergies else 'None'}
- Current Medications: {', '.join(patient_data.current_medications) if patient_data.current_medications else 'None'}

Provide dermatological recommendations in JSON format:
{
    "recommendations": [
        {
            "type": "follow_up|treatment|test|medication",
            "title": "string",
            "description": "detailed explanation",
            "priority": "high|medium|low",
            "suggested_date": "YYYY-MM-DD",
            "reasoning": "clinical reasoning"
        }
    ],
    "next_appointment": "YYYY-MM-DD",
    "additional_notes": "string"
}"""

    @staticmethod
    async def generate_recommendations(patient_data: PatientHistory) -> AIRecommendationResponse:
        try:
            prompt = DermatologyAIService.create_prompt(patient_data)
            
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a specialized dermatology AI assistant trained to provide evidence-based recommendations."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=1000
            )

            result = json.loads(response.choices[0].message.content)
            return AIRecommendationResponse(**result)

        except Exception as e:
            raise Exception(f"Failed to generate AI recommendations: {str(e)}") 