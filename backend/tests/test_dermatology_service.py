import pytest
from app.services.ai_service import DermatologyAIService
from app.models.ai_models import PatientHistory

@pytest.fixture
def dermatology_service():
    return DermatologyAIService()

@pytest.fixture
def sample_medical_results():
    return {
        "diagnosis": {
            "primary_diagnosis": "Contact Dermatitis",
            "confidence": 0.85,
            "differential_diagnoses": ["Atopic Dermatitis"],
            "reasoning": "Based on symptoms and presentation"
        },
        "treatment_plan": {
            "recommendations": "Apply topical corticosteroids",
            "follow_up": "2 weeks",
            "lifestyle_modifications": ["Avoid triggers"],
            "expected_outcomes": "Improvement expected"
        },
        "medical_context": "Patient presents with typical contact dermatitis symptoms"
    }

async def test_process_patient_case(dermatology_service, sample_patient_data, sample_medical_results):
    result = await dermatology_service.process_patient_case(
        patient_data=sample_patient_data,
        medical_results=sample_medical_results
    )
    
    assert "recommendation_id" in result
    assert "treatment_plan" in result
    assert "validation_results" in result
    assert "enhanced_results" in result
    
    treatment = result["treatment_plan"]
    assert "recommendations" in treatment
    assert "follow_up" in treatment
    assert isinstance(treatment["recommendations"], str) 