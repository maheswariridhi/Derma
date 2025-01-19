import pytest
from app.services.validation_service import RecommendationValidator
from app.services.rag.medical_knowledge import MedicalKnowledgeRAG

@pytest.fixture
def validator():
    medical_knowledge = MedicalKnowledgeRAG()
    return RecommendationValidator(medical_knowledge)

@pytest.fixture
def sample_recommendation():
    return {
        "condition": "dermatitis",
        "recommendations": "Apply topical corticosteroids twice daily",
        "contraindications": "None known",
        "follow_up": "2 weeks"
    }

@pytest.mark.asyncio
async def test_validate_recommendation(validator, sample_recommendation):
    result = await validator.validate_recommendation(sample_recommendation)
    
    assert hasattr(result, "is_valid")
    assert hasattr(result, "confidence")
    assert hasattr(result, "warnings")
    assert hasattr(result, "suggestions")
    assert isinstance(result.warnings, list) 