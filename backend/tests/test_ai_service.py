import pytest
from app.services.ai_service import DermatologyAIService

@pytest.fixture
def ai_service():
    return DermatologyAIService()

@pytest.mark.asyncio
async def test_analyze_patient(ai_service):
    # Use a known test patient ID from Firebase
    test_patient_id = "test_patient_1"
    
    # Test full analysis
    result = await ai_service.analyze_patient(test_patient_id)
    
    # Assert the structure of the response
    assert "diagnosis" in result
    assert "treatment_plan" in result
    assert "validation_results" in result
    
    # Check diagnosis structure
    diagnosis = result["diagnosis"]
    assert "primary_diagnosis" in diagnosis
    assert "confidence" in diagnosis
    assert isinstance(diagnosis["confidence"], float)
    
    # Check treatment plan structure
    treatment = result["treatment_plan"]
    assert "recommendations" in treatment
    assert "follow_up" in treatment
    assert isinstance(treatment["recommendations"], str)

@pytest.mark.asyncio
async def test_invalid_patient(ai_service):
    # Test with non-existent patient ID
    with pytest.raises(ValueError):
        await ai_service.analyze_patient("non_existent_id") 