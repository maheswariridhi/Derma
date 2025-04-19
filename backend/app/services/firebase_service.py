import firebase_admin
from firebase_admin import credentials, firestore
from typing import Dict, Any, List, Optional
import os
from dotenv import load_dotenv
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class FirebaseService:
    def __init__(self):
        try:
            # Initialize Firebase Admin SDK
            if not firebase_admin._apps:
                logger.info("Initializing Firebase Admin SDK...")
                cred = credentials.Certificate({
                    "type": "service_account",
                    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
                    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
                    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace("\\n", "\n"),
                    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
                    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL")
                })
                firebase_admin.initialize_app(cred)
                logger.info("Firebase Admin SDK initialized successfully")
            
            self.db = firestore.client()
            self.hospital_id = 'hospital_dermai_01'  # Default hospital ID
            
            # Initialize collections
            self.patients_collection = self.db.collection('hospitals').document(self.hospital_id).collection('patients')
            self.reports_collection = self.db.collection('hospitals').document(self.hospital_id).collection('reports')
            self.treatments_collection = self.db.collection('hospitals').document(self.hospital_id).collection('treatments')
            self.medicines_collection = self.db.collection('hospitals').document(self.hospital_id).collection('medicines')
            self.doctors_collection = self.db.collection('hospitals').document(self.hospital_id).collection('doctors')
            
            logger.info("All collections initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Firebase: {str(e)}")
            raise e

    def get_collection(self, hospital_id: str, collection_name: str):
        return self.db.collection("hospitals").document(hospital_id).collection(collection_name)

    # Patient Methods
    async def create_patient(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new patient document in Firestore."""
        try:
            doc_ref = self.patients_collection.document()
            
            # Use a local timestamp for the response
            current_time = datetime.now().isoformat()
            
            # Prepare the data to save to Firestore
            firestore_data = {
                **patient_data,
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'active'
            }
            
            # Set the document in Firestore
            doc_ref.set(firestore_data)
            
            # Prepare response data (with string timestamps instead of Firestore objects)
            response_data = {
                **patient_data,
                'id': doc_ref.id,
                'created_at': current_time,
                'updated_at': current_time,
                'status': 'active'
            }
            
            return response_data
        except Exception as e:
            logger.error(f"Error creating patient: {str(e)}")
            return {"error": str(e)}

    async def get_patient(self, patient_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a patient document by ID."""
        try:
            doc_ref = self.patients_collection.document(patient_id)
            doc = doc_ref.get()
            if doc.exists:
                return {"id": doc.id, **doc.to_dict()}
            return None
        except Exception as e:
            print(f"Error getting patient: {e}")
            return None

    async def get_all_patients(self) -> List[Dict[str, Any]]:
        """Retrieve all patient documents."""
        try:
            docs = self.patients_collection.stream()
            return [{"id": doc.id, **doc.to_dict()} for doc in docs]
        except Exception as e:
            print(f"Error getting all patients: {e}")
            return []

    async def update_patient(self, patient_id: str, patient_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a patient document."""
        try:
            doc_ref = self.patients_collection.document(patient_id)
            # Remove any None values from the update data
            update_data = {k: v for k, v in patient_data.items() if v is not None}
            update_data['updated_at'] = firestore.SERVER_TIMESTAMP
            
            doc_ref.update(update_data)
            
            # Get and return the updated document
            updated_doc = doc_ref.get()
            if updated_doc.exists:
                return {"id": updated_doc.id, **updated_doc.to_dict()}
            return None
        except Exception as e:
            print(f"Error updating patient: {e}")
            return None

    async def delete_patient(self, patient_id: str) -> bool:
        """Delete a patient from the database."""
        try:
            logger.info(f"Deleting patient with ID: {patient_id}")
            doc_ref = self.patients_collection.document(patient_id)
            doc_ref.delete()
            logger.info(f"Patient {patient_id} deleted successfully")
            return True
        except Exception as e:
            logger.error(f"Error deleting patient: {str(e)}")
            return False

    # Report Methods
    async def create_report(self, report_data: Dict[str, Any]) -> str:
        """Create a new report."""
        try:
            doc_ref = self.reports_collection.document()
            report_data.update({
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            doc_ref.set(report_data)
            return doc_ref.id
        except Exception as e:
            print(f"Error creating report: {e}")
            raise e

    async def get_report(self, report_id: str) -> Optional[Dict[str, Any]]:
        """Get a report by ID."""
        try:
            doc = self.reports_collection.document(report_id).get()
            if doc.exists:
                return {"id": doc.id, **doc.to_dict()}
            return None
        except Exception as e:
            print(f"Error getting report: {e}")
            return None

    async def get_patient_reports(self, patient_id: str) -> List[Dict[str, Any]]:
        """Get all reports for a specific patient."""
        try:
            docs = self.reports_collection.where('patientId', '==', patient_id).order_by('created_at', direction=firestore.Query.DESCENDING).stream()
            return [{"id": doc.id, **doc.to_dict()} for doc in docs]
        except Exception as e:
            print(f"Error getting patient reports: {e}")
            return []

    # Treatment Methods
    async def create_treatment(self, treatment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new treatment."""
        try:
            logger.info(f"Creating treatment: {treatment_data}")
            doc_ref = self.treatments_collection.document()
            treatment_data.update({
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            doc_ref.set(treatment_data)
            logger.info(f"Treatment created with ID: {doc_ref.id}")
            return {"id": doc_ref.id, **treatment_data}
        except Exception as e:
            logger.error(f"Error creating treatment: {str(e)}")
            raise e

    async def get_treatment(self, treatment_id: str) -> Optional[Dict[str, Any]]:
        """Get a treatment by ID."""
        try:
            doc = self.treatments_collection.document(treatment_id).get()
            if doc.exists:
                return {"id": doc.id, **doc.to_dict()}
            return None
        except Exception as e:
            print(f"Error getting treatment: {e}")
            return None

    async def get_all_treatments(self) -> List[Dict[str, Any]]:
        """Get all treatments."""
        try:
            logger.info("Fetching all treatments")
            docs = self.treatments_collection.stream()
            treatments = [{"id": doc.id, **doc.to_dict()} for doc in docs]
            logger.info(f"Found {len(treatments)} treatments")
            return treatments
        except Exception as e:
            logger.error(f"Error getting all treatments: {str(e)}")
            raise e

    async def update_treatment(self, treatment_id: str, treatment_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a treatment."""
        try:
            doc_ref = self.treatments_collection.document(treatment_id)
            update_data = {k: v for k, v in treatment_data.items() if v is not None}
            update_data['updated_at'] = firestore.SERVER_TIMESTAMP
            doc_ref.update(update_data)
            
            updated_doc = doc_ref.get()
            if updated_doc.exists:
                return {"id": updated_doc.id, **updated_doc.to_dict()}
            return None
        except Exception as e:
            print(f"Error updating treatment: {e}")
            return None

    async def delete_treatment(self, treatment_id: str) -> bool:
        """Delete a treatment from the database."""
        try:
            doc_ref = self.treatments_collection.document(treatment_id)
            doc_ref.delete()
            return True
        except Exception as e:
            print(f"Error deleting treatment: {e}")
            return False

    # Medicine Methods
    async def create_medicine(self, medicine_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new medicine."""
        try:
            logger.info(f"Creating medicine: {medicine_data}")
            doc_ref = self.medicines_collection.document()
            medicine_data.update({
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            doc_ref.set(medicine_data)
            logger.info(f"Medicine created with ID: {doc_ref.id}")
            return {"id": doc_ref.id, **medicine_data}
        except Exception as e:
            logger.error(f"Error creating medicine: {str(e)}")
            raise e

    async def get_medicine(self, medicine_id: str) -> Optional[Dict[str, Any]]:
        """Get a medicine by ID."""
        try:
            doc = self.medicines_collection.document(medicine_id).get()
            if doc.exists:
                return {"id": doc.id, **doc.to_dict()}
            return None
        except Exception as e:
            print(f"Error getting medicine: {e}")
            return None

    async def get_all_medicines(self) -> List[Dict[str, Any]]:
        """Get all medicines."""
        try:
            logger.info("Fetching all medicines")
            docs = self.medicines_collection.stream()
            medicines = [{"id": doc.id, **doc.to_dict()} for doc in docs]
            logger.info(f"Found {len(medicines)} medicines")
            return medicines
        except Exception as e:
            logger.error(f"Error getting all medicines: {str(e)}")
            raise e

    async def update_medicine(self, medicine_id: str, medicine_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a medicine."""
        try:
            doc_ref = self.medicines_collection.document(medicine_id)
            update_data = {k: v for k, v in medicine_data.items() if v is not None}
            update_data['updated_at'] = firestore.SERVER_TIMESTAMP
            doc_ref.update(update_data)
            
            updated_doc = doc_ref.get()
            if updated_doc.exists:
                return {"id": updated_doc.id, **updated_doc.to_dict()}
            return None
        except Exception as e:
            print(f"Error updating medicine: {e}")
            return None

    async def delete_medicine(self, medicine_id: str) -> bool:
        """Delete a medicine from the database."""
        try:
            doc_ref = self.medicines_collection.document(medicine_id)
            doc_ref.delete()
            return True
        except Exception as e:
            print(f"Error deleting medicine: {e}")
            return False

    async def update_medicine_stock(self, medicine_id: str, quantity: int) -> bool:
        """Update medicine stock quantity."""
        try:
            doc_ref = self.medicines_collection.document(medicine_id)
            doc = doc_ref.get()
            if not doc.exists:
                return False
            
            current_stock = doc.get('stock', 0)
            new_stock = current_stock + quantity
            
            if new_stock < 0:
                return False
                
            doc_ref.update({
                'stock': new_stock,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            return True
        except Exception as e:
            print(f"Error updating medicine stock: {e}")
            return False

    # Doctor Methods
    async def create_doctor(self, hospital_id: str, doctor_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create or update a doctor document in Firestore."""
        try:
            logger.info(f"Creating/updating doctor: {doctor_data}")
            # Check if doctors exist for this hospital
            doctors = await self.get_all_doctors(hospital_id)
            
            if doctors and len(doctors) > 0:
                # Update the first doctor document
                doc_ref = self.get_collection(hospital_id, "doctors").document(doctors[0]["id"])
                update_data = {
                    **doctor_data,
                    "updated_at": firestore.SERVER_TIMESTAMP
                }
                doc_ref.update(update_data)
                logger.info(f"Doctor updated with ID: {doc_ref.id}")
                return {"id": doc_ref.id, **doctor_data}
            else:
                # Create a new doctor document
                doc_ref = self.get_collection(hospital_id, "doctors").document()
                doctor_data.update({
                    "created_at": firestore.SERVER_TIMESTAMP,
                    "updated_at": firestore.SERVER_TIMESTAMP
                })
                doc_ref.set(doctor_data)
                logger.info(f"Doctor created with ID: {doc_ref.id}")
                return {"id": doc_ref.id, **doctor_data}
        except Exception as e:
            logger.error(f"Error creating/updating doctor: {str(e)}")
            return {"error": str(e)}

    async def get_all_doctors(self, hospital_id: str) -> List[Dict[str, Any]]:
        """Get all doctors for a hospital."""
        try:
            logger.info(f"Fetching all doctors for hospital: {hospital_id}")
            docs = self.get_collection(hospital_id, "doctors").stream()
            doctors = [{"id": doc.id, **doc.to_dict()} for doc in docs]
            logger.info(f"Found {len(doctors)} doctors")
            return doctors
        except Exception as e:
            logger.error(f"Error getting all doctors: {str(e)}")
            return [] 