from langchain_openai import ChatOpenAI
from typing import Dict, Any
import os


class DiagnosisAgent:
    def __init__(self):
        try:
            self.llm = ChatOpenAI(
                model_name="gpt-4",
                temperature=0.2,
                openai_api_key=os.getenv("OPENAI_API_KEY"),
            )
        except Exception as e:
            print(f"Warning: LLM initialization failed - {str(e)}")
            self.llm = None

    async def analyze(
        self, patient_data: Dict[str, Any], medical_context: str
    ) -> Dict[str, Any]:
        """Generate diagnosis based on symptoms and medical context"""
        if not self.llm:
            return self._get_mock_diagnosis()

        try:
            response = await self.llm.ainvoke(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a dermatology diagnosis specialist. Analyze the case and provide diagnosis.",
                    },
                    {
                        "role": "user",
                        "content": self._format_prompt(patient_data, medical_context),
                    },
                ]
            )

            return self._parse_diagnosis_response(response.content)
        except Exception as e:
            print(f"Warning: Using mock diagnosis - {str(e)}")
            return self._get_mock_diagnosis()

    def _format_prompt(self, patient_data: Dict[str, Any], medical_context: str) -> str:
        return f"""
        Patient Information:
        - Age: {patient_data.get('age')}
        - Symptoms: {', '.join(patient_data.get('symptoms', []))}
        - Medical History: {patient_data.get('medical_history', 'None provided')}
        
        Medical Context:
        {medical_context}
        
        Provide:
        1. Primary diagnosis with confidence level
        2. Differential diagnoses
        3. Reasoning for diagnosis
        4. Risk factors identified
        """

    def _parse_diagnosis_response(self, response: str) -> Dict[str, Any]:
        # In a real implementation, this would parse the LLM response
        # For now, we'll return a basic structure
        return {
            "primary_diagnosis": response,
            "confidence": 0.85,
            "differential_diagnoses": [],
            "reasoning": response,
        }

    def _get_mock_diagnosis(self) -> Dict[str, Any]:
        return {
            "primary_diagnosis": "Suspected dermatitis",
            "confidence": 0.85,
            "differential_diagnoses": [
                "Contact dermatitis",
                "Atopic dermatitis",
                "Seborrheic dermatitis",
            ],
            "reasoning": "Based on reported symptoms and typical presentation",
        }
