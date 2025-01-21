import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.ai_orchestrator import AIOrchestrator
from app.services.ai_service import DermatologyAIService

client = TestClient(app)

@pytest.mark.asyncio
async def test_full_analysis_workflow(sample_patient_data):
    # Test API endpoint
    response = client.post("/api/ai/analyze", json=sample_patient_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "recommendations" in data
    assert isinstance(data["recommendations"], str)  # Changed to str
    assert len(data["recommendations"]) > 0
    assert "next_appointment" in data
    assert "confidence_score" in data
    
    # Test validation endpoint
    if data["recommendations"]:
        validation_response = client.post("/api/ai/validate", json={"recommendation": data["recommendations"]})
        assert validation_response.status_code == 200
        
        validation_data = validation_response.json()
        assert "is_valid" in validation_data
        assert "confidence" in validation_data

@pytest.mark.asyncio
async def test_error_handling():
    # Test with invalid data
    invalid_data = {"patient_name": "Test"}  # Missing required fields
    response = client.post("/api/ai/analyze", json=invalid_data)
    assert response.status_code == 422  # Validation error
    
    # Test with empty symptoms
    data = {
        "patient_name": "Test Patient",
        "age": 35,
        "condition": "rash",
        "symptoms": [],  # Empty symptoms
        "previous_treatments": [],
        "last_visit": "2024-01-01"
    }
    response = client.post("/api/ai/analyze", json=data)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["recommendations"], str)  # Changed to str
    assert "confidence_score" in data
    assert data["confidence_score"] < 0.5  # Lower confidence due to empty symptoms 