from typing import Dict, Any, List
import uuid
from app.services.rag.medical_knowledge import MedicalKnowledgeRAG
from app.services.specialty_features import DermatologySpecialist, SkinConditionAnalysis
from app.services.validation_service import RecommendationValidator, ValidationResult
from app.models.ai_models import Recommendation, ValidationResponse
from mock_handler import MockHandler

class DermatologyAIService:
    def __init__(self):
        self.medical_knowledge = MedicalKnowledgeRAG()
        self.specialist = DermatologySpecialist()
        self.validator = RecommendationValidator(self.medical_knowledge)

    async def process_patient_case(
        self, 
        patient_data: Dict[str, Any],
        medical_results: Dict[str, Any]
    ) -> Dict[str, Any]:
        try:
            # Get specialty-specific analysis
            specialty_analysis = await self.specialist.analyze_skin_condition(
                patient_data,
                medical_results
            )
            
            # Validate recommendations
            validation_results = await self.validator.validate_recommendation(
                medical_results["treatment_plan"]
            )
            
            # Generate recommendation ID for tracking
            recommendation_id = str(uuid.uuid4())
            
            # Enhanced results
            enhanced_results = await self._enhance_with_specialty_knowledge(
                medical_results,
                patient_data
            )
            
            return {
                "recommendation_id": recommendation_id,
                "specialty_analysis": specialty_analysis.model_dump(),
                "validation_results": validation_results.model_dump(),
                "enhanced_results": enhanced_results
            }
        except Exception as e:
            print(f"Warning: Error in specialty processing - {str(e)}")
            return MockHandler.get_mock_specialty_results()

    async def _enhance_with_specialty_knowledge(
        self,
        medical_results: Dict[str, Any],
        patient_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Enhance medical results with dermatology-specific insights"""
        try:
            relevant_knowledge = await self.medical_knowledge.query(
                symptoms=patient_data.get("symptoms", []),
                medical_history=patient_data.get("medical_history")
            )
            
            return {
                "specialty_specific": relevant_knowledge,
                "risk_factors": self._extract_risk_factors(relevant_knowledge)
            }
        except Exception as e:
            print(f"Warning: Error enhancing results - {str(e)}")
            return self._get_mock_enhanced_results()

    def _extract_risk_factors(self, knowledge: str) -> List[str]:
        # In a real implementation, this would parse the knowledge text
        return ["Age-related factors", "Environmental exposure"]

    def _get_mock_enhanced_results(self) -> Dict[str, Any]:
        return {
            "specialty_specific": "Common dermatological presentation",
            "risk_factors": ["Age-related factors", "Environmental exposure"]
        }
