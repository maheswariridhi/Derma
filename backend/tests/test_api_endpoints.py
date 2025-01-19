from fastapi.testclient import TestClient
from app.main import app
import pytest

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_analyze_endpoint():
    test_patient = {
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
    
    response = client.post("/api/ai/analyze", json=test_patient)
    assert response.status_code == 200
    
    data = response.json()
    assert "recommendations" in data
    assert "next_appointment" in data
    assert "medical_context" in data
    assert "confidence_score" in data 