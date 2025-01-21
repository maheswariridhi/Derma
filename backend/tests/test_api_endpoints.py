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
    assert isinstance(data["recommendations"], str)  # Changed to str
    assert len(data["recommendations"]) > 0
    assert "next_appointment" in data
    assert "confidence_score" in data

def test_analyze_patient_endpoint():
    # Test with a known patient ID
    test_patient_id = "test_patient_1"
    response = client.post(f"/api/ai/analyze/{test_patient_id}")
    
    assert response.status_code == 200
    data = response.json()
    
    # Check response structure
    assert "recommendations" in data
    assert isinstance(data["recommendations"], str)  # Changed to str
    assert len(data["recommendations"]) > 0
    assert "next_appointment" in data
    assert "confidence_score" in data

def test_get_patient_endpoint():
    # Test with a known patient ID
    test_patient_id = "test_patient_1"
    response = client.get(f"/api/patients/{test_patient_id}")
    
    assert response.status_code == 200
    patient = response.json()
    
    # Check patient data structure
    assert "name" in patient
    assert "symptoms" in patient
    assert "medical_history" in patient

def test_invalid_patient_endpoints():
    # Test with non-existent patient ID
    invalid_id = "non_existent_id"
    
    # Test analyze endpoint
    response = client.post(f"/api/ai/analyze/{invalid_id}")
    assert response.status_code == 404
    
    # Test get patient endpoint
    response = client.get(f"/api/patients/{invalid_id}")
    assert response.status_code == 404 