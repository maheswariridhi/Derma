import pytest
from app.services.rag.medical_knowledge import MedicalKnowledgeRAG

@pytest.fixture
def medical_rag():
    return MedicalKnowledgeRAG()

@pytest.mark.asyncio
async def test_query_with_symptoms(medical_rag):
    symptoms = ["itching", "redness"]
    result = await medical_rag.query(symptoms)
    assert isinstance(result, str)
    assert len(result) > 0

@pytest.mark.asyncio
async def test_query_with_medical_history(medical_rag):
    symptoms = ["rash"]
    medical_history = "Previous allergic reactions"
    result = await medical_rag.query(symptoms, medical_history)
    assert isinstance(result, str)
    assert "treatment" in result.lower() or "condition" in result.lower() 