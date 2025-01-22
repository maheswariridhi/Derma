from app.services.firebase_service import db

HOSPITAL_ID = 'hospital_dermai_01'

async def setup_test_data():
    # Add a test patient to Firebase
    test_patient = {
        "name": "Test Patient",
        "age": 30,
        "symptoms": ["rash", "itching"],
        "medical_history": "No prior conditions",
        "medications": [],
        "lastVisit": "2024-01-01",
        "status": "Active",
        "hospitalId": HOSPITAL_ID
    }
    
    # Add to Firebase using the hospital structure
    doc_ref = (db.collection('hospitals')
               .document(HOSPITAL_ID)
               .collection('patients')
               .document('test_patient_1'))
    doc_ref.set(test_patient)

async def cleanup_test_data():
    # Remove test data after tests
    doc_ref = (db.collection('hospitals')
               .document(HOSPITAL_ID)
               .collection('patients')
               .document('test_patient_1'))
    doc_ref.delete() 