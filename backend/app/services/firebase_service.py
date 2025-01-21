import firebase_admin
from firebase_admin import credentials, firestore
import os
from pathlib import Path
import json

class FirebaseService:
    def __init__(self):
        self.is_testing = os.getenv('TESTING', 'false').lower() == 'true'
        
        try:
            # Initialize Firebase if not already initialized
            if not firebase_admin._apps:
                cred = credentials.Certificate("serviceAccountKey.json")
                firebase_admin.initialize_app(cred)
            
            self.db = firestore.client()
            print("Firebase initialized successfully!")
        except Exception as e:
            print(f"Firebase initialization error: {e}")
            raise

    async def create_patient(self, patient_data: dict):
        """Create a new patient with basic information"""
        if self.is_testing:
            return {"id": "test_patient_1"}
        
        try:
            print("Creating patient:", patient_data)  # Debug log
            doc_ref = self.db.collection('patients').document()
            
            patient_doc = {
                "name": patient_data["name"],
                "email": patient_data.get("email", ""),
                "phone": patient_data.get("phone", ""),
                "status": "Active"
            }
            
            doc_ref.set(patient_doc)
            result = {"id": doc_ref.id, **patient_doc}
            print("Patient created:", result)  # Debug log
            return result
            
        except Exception as e:
            print(f"Error creating patient: {e}")
            return {"error": str(e)}

    async def get_patient(self, patient_id: str):
        """Get a single patient by ID"""
        if self.is_testing:
            return {"id": patient_id, "name": "Test Patient"}
        
        try:
            doc_ref = self.db.collection('patients').document(patient_id)
            doc = doc_ref.get()
            
            if doc.exists:
                patient_data = doc.to_dict()
                patient_data['id'] = doc.id
                return patient_data
            else:
                return None
                
        except Exception as e:
            print(f"Error getting patient: {e}")
            return {"error": str(e)}

    async def add_patient_visit(self, patient_id: str, visit_data: dict):
        """Add a new visit record to patient history"""
        if self.is_testing:
            return {"success": True}
            
        try:
            doc_ref = self.db.collection('patients').document(patient_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return {"error": "Patient not found"}
                
            visit = {
                "date": firestore.SERVER_TIMESTAMP,
                "symptoms": visit_data.get("symptoms", []),
                "diagnosis": visit_data.get("diagnosis", ""),
                "treatment": visit_data.get("treatment", ""),
                "notes": visit_data.get("notes", ""),
                "follow_up": visit_data.get("follow_up", "")
            }
            
            # Add visit to visits array
            doc_ref.update({
                "visits": firestore.ArrayUnion([visit]),
                "conditions": firestore.ArrayUnion([visit_data.get("diagnosis")] if visit_data.get("diagnosis") else [])
            })
            
            return {"success": True, "visit": visit}
            
        except Exception as e:
            print(f"Error adding visit: {e}")
            return {"error": str(e)}

    async def get_all_patients(self):
        """Get all patients from Firestore"""
        if self.is_testing:
            return [{"id": "test_patient_1", "name": "Test Patient"}]
        
        try:
            print("Fetching all patients...")  # Debug log
            patients_ref = self.db.collection('patients')
            docs = patients_ref.stream()
            
            patients = []
            for doc in docs:
                patient_data = doc.to_dict()
                patient_data['id'] = doc.id
                patients.append(patient_data)
            
            print("Retrieved patients:", patients)  # Debug log
            return patients
            
        except Exception as e:
            print(f"Error getting all patients: {e}")
            return {"error": str(e)} 