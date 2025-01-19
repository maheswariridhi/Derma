from typing import Dict, Any
from app.services.agents.diagnosis_agent import DiagnosisAgent
from app.services.agents.treatment_agent import TreatmentAgent
from app.services.rag.medical_knowledge import MedicalKnowledgeRAG

class AIOrchestrator:
    def __init__(self):
        self.medical_rag = MedicalKnowledgeRAG()
        self.diagnosis_agent = DiagnosisAgent()
        self.treatment_agent = TreatmentAgent()

    async def process_patient_case(self, patient_data: Dict[str, Any]):
        # Get medical context from RAG
        medical_context = await self.medical_rag.query(
            symptoms=patient_data.get("symptoms", []),
            medical_history=patient_data.get("medical_history", "")
        )

        # Generate diagnosis
        diagnosis = await self.diagnosis_agent.analyze(
            patient_data=patient_data,
            medical_context=medical_context
        )

        # Create treatment plan
        treatment_plan = await self.treatment_agent.generate_plan(
            patient_data=patient_data,
            diagnosis=diagnosis,
            medical_context=medical_context
        )

        return {
            "diagnosis": diagnosis,
            "treatment_plan": treatment_plan,
            "medical_context": medical_context
        }