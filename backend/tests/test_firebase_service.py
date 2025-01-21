import pytest
from app.services.firebase_service import FirebaseService

@pytest.fixture
def firebase_service():
    return FirebaseService()

@pytest.mark.asyncio
async def test_get_patient(firebase_service):
    # Test getting a patient
    patient = await firebase_service.get_patient("test_patient_1")
    
    # Assert patient data structure
    assert patient is not None
    assert "name" in patient
    assert "symptoms" in patient
    assert "medical_history" in patient

@pytest.mark.asyncio
async def test_get_all_patients(firebase_service):
    # Test getting all patients
    patients = await firebase_service.get_all_patients()
    
    # Assert we got a list of patients
    assert isinstance(patients, list)
    assert len(patients) > 0
    # Assert each patient has required fields
    for patient in patients:
        assert "id" in patient
        assert "name" in patient 