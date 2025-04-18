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
            self.queues_collection = self.db.collection('hospitals').document(self.hospital_id).collection('queues')
            self.treatments_collection = self.db.collection('hospitals').document(self.hospital_id).collection('treatments')
            self.medicines_collection = self.db.collection('hospitals').document(self.hospital_id).collection('medicines')
            
            logger.info("All collections initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Firebase: {str(e)}")
            raise e

    # Patient Methods
    async def create_patient(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new patient document in Firestore."""
        try:
            doc_ref = self.patients_collection.document()
            patient_data.update({
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP,
                'status': 'active'
            })
            doc_ref.set(patient_data)
            return {"id": doc_ref.id, **patient_data}
        except Exception as e:
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

    # Queue Methods
    async def get_queue_status(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get the current queue status."""
        try:
            today = datetime.now().strftime("%Y-%m-%d")
            docs = self.queues_collection.where('date', '==', today).where('status', 'in', ['waiting', 'in-progress']).order_by('checkInTime').stream()
            
            result: Dict[str, List[Dict[str, Any]]] = {
                'check-up': [],
                'treatment': [],
                'billing': []
            }
            
            for doc in docs:
                data = doc.to_dict()
                queue_type = data.get('queueType', 'check-up')
                if queue_type in result:
                    result[queue_type].append({"id": doc.id, **data})
            
            return result
        except Exception as e:
            print(f"Error getting queue status: {e}")
            return {'check-up': [], 'treatment': [], 'billing': []}

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