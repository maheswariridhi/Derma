from fastapi.testclient import TestClient
import pytest
from app.services.ai_orchestrator import AIOrchestrator
from app.models.ai_models import PatientHistory

@pytest.fixture
def ai_orchestrator():
    return AIOrchestrator()

@pytest.fixture
def sample_patient_data():
    return {
        "patient_name": "Test Patient",
        "age": 35,
        "condition": "rash",
        "symptoms": ["itching", "redness"],
        "previous_treatments": ["antihistamines"],
        "last_visit": "2024-01-01",
        "allergies": ["penicillin"],
        "current_medications": [],
        "medical_history": "No significant history"
    }

async def test_process_patient_case(ai_orchestrator, sample_patient_data):
    result = await ai_orchestrator.process_patient_case(sample_patient_data)
    
    assert "diagnosis" in result
    assert "treatment_plan" in result
    assert "medical_context" in result
    
    diagnosis = result["diagnosis"]
    assert "primary_diagnosis" in diagnosis
    assert "confidence" in diagnosis
    assert isinstance(diagnosis["confidence"], float)
    
    treatment = result["treatment_plan"]
    assert "recommendations" in treatment
    assert "follow_up" in treatment 