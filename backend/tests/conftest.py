import pytest
import os
from dotenv import load_dotenv
from datetime import datetime

# Load test environment variables
load_dotenv(".env.test", override=True)

# Set default event loop scope for async tests
pytest.ini_options = {
    "asyncio_mode": "auto",
    "asyncio_default_fixture_loop_scope": "function"
}

@pytest.fixture(autouse=True)
def env_setup():
    """Setup test environment variables"""
    os.environ["OPENAI_API_KEY"] = "test-key"
    os.environ["MOCK_MODE"] = "true"

@pytest.fixture
def sample_patient_data():
    """Shared patient data fixture"""
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

@pytest.fixture
def sample_medical_results():
    """Shared medical results fixture"""
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

@pytest.fixture
def sample_diagnosis():
    """Shared diagnosis fixture"""
    return {
        "primary_diagnosis": "Contact Dermatitis",
        "confidence": 0.85,
        "differential_diagnoses": ["Atopic Dermatitis"],
        "reasoning": "Based on symptoms and presentation"
    } 