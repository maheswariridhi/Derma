import pytest
from app.services.agents.treatment_agent import TreatmentAgent

@pytest.fixture
def treatment_agent():
    return TreatmentAgent()

@pytest.fixture
def sample_diagnosis():
    return {
        "primary_diagnosis": "Contact Dermatitis",
        "confidence": 0.85,
        "differential_diagnoses": ["Atopic Dermatitis"],
        "reasoning": "Based on symptoms and presentation"
    }

@pytest.mark.asyncio
async def test_generate_treatment_plan(treatment_agent, sample_patient_data, sample_diagnosis):
    medical_context = "Patient presents with typical contact dermatitis symptoms"
    
    result = await treatment_agent.generate_plan(
        patient_data=sample_patient_data,
        diagnosis=sample_diagnosis,
        medical_context=medical_context
    )
    
    assert "recommendations" in result
    assert "follow_up" in result
    assert "lifestyle_modifications" in result
    assert isinstance(result["lifestyle_modifications"], list)
    assert "expected_outcomes" in result 