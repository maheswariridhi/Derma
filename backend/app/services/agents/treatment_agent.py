from langchain_openai import ChatOpenAI
from typing import Dict, Any
from datetime import datetime
import os
from mock_handler import MockHandler

class TreatmentAgent:
    def __init__(self):
        try:
            self.llm = ChatOpenAI(
                model_name="gpt-4",
                temperature=0.2,
                openai_api_key=os.getenv("OPENAI_API_KEY")
            )
        except Exception as e:
            print(f"Warning: LLM initialization failed - {str(e)}")
            self.llm = None

    async def generate_plan(
        self, 
        patient_data: Dict[str, Any],
        diagnosis: Dict[str, Any],
        medical_context: str
    ) -> Dict[str, Any]:
        """Generate treatment plan based on diagnosis and medical context"""
        if not self.llm:
            return self._get_mock_treatment_plan()

        try:
            response = await self.llm.ainvoke(
                messages=[{
                    "role": "system",
                    "content": "You are a dermatology treatment specialist. Generate a detailed treatment plan."
                }, {
                    "role": "user",
                    "content": self._format_prompt(patient_data, diagnosis, medical_context)
                }]
            )
            
            return self._parse_treatment_response(response.content)
        except Exception as e:
            print(f"Warning: Using mock treatment plan - {str(e)}")
            return self._get_mock_treatment_plan()

    def _format_prompt(self, patient_data: Dict[str, Any], diagnosis: Dict[str, Any], medical_context: str) -> str:
        return f"""
        Patient Information:
        - Age: {patient_data.get('age')}
        - Symptoms: {', '.join(patient_data.get('symptoms', []))}
        - Medical History: {patient_data.get('medical_history', 'None provided')}
        
        Diagnosis:
        {diagnosis.get('primary_diagnosis')}
        
        Medical Context:
        {medical_context}
        
        Provide:
        1. Treatment recommendations
        2. Follow-up schedule
        3. Lifestyle modifications
        4. Expected outcomes
        """

    def _parse_treatment_response(self, response: str) -> Dict[str, Any]:
        return {
            "recommendations": response,
            "follow_up": "2 weeks",  # This should be extracted from the response
            "lifestyle_modifications": [],  # This should be extracted from the response
            "expected_outcomes": response,
            "created_at": datetime.now().isoformat()
        }

    def _get_mock_treatment_plan(self) -> Dict[str, Any]:
        return {
            "recommendations": "1. Apply prescribed topical medication twice daily\n2. Avoid known irritants",
            "follow_up": "2 weeks",
            "lifestyle_modifications": [
                "Avoid hot showers",
                "Use gentle, fragrance-free skincare products",
                "Stay hydrated"
            ],
            "expected_outcomes": "Improvement in symptoms within 2-3 weeks with proper treatment adherence",
            "created_at": datetime.now().isoformat()
        } 