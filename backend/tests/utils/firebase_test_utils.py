from app.services.firebase_service import db

async def setup_test_data():
    # Add a test patient to Firebase
    test_patient = {
        "name": "Test Patient",
        "age": 30,
        "symptoms": ["rash", "itching"],
        "medical_history": "No prior conditions",
        "medications": [],
        "lastVisit": "2024-01-01"
    }
    
    # Add to Firebase
    doc_ref = db.collection('patients').document('test_patient_1')
    doc_ref.set(test_patient)

async def cleanup_test_data():
    # Remove test data after tests
    doc_ref = db.collection('patients').document('test_patient_1')
    doc_ref.delete() 