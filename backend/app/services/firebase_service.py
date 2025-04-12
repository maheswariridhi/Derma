import firebase_admin
from firebase_admin import credentials, firestore
from typing import Dict, Any, List, Optional
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

class FirebaseService:
    def __init__(self):
        # Initialize Firebase Admin SDK
        try:
            firebase_admin.get_app()
        except ValueError:
            # Use the project ID from environment variables
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
            firebase_admin.initialize_app(cred, {
                'projectId': os.getenv("FIREBASE_PROJECT_ID")
            })
        
        self.db = firestore.client()
        self.hospital_id = 'hospital_dermai_01'  # Default hospital ID
        self.patients_collection = self.db.collection('hospitals').document(self.hospital_id).collection('patients')
        self.queues_collection = self.db.collection('hospitals').document(self.hospital_id).collection('queues')
        self.reports_collection = self.db.collection('hospitals').document(self.hospital_id).collection('reports')

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

    async def get_all_patients(self) -> List[Dict[str, Any]]:
        """Retrieve all patient documents."""
        try:
            docs = self.patients_collection.stream()
            return [{"id": doc.id, **doc.to_dict()} for doc in docs]
        except Exception as e:
            print(f"Error getting all patients: {e}")
            return []

    async def update_patient_status(self, patient_id: str, status: str) -> bool:
        """Update a patient's status."""
        try:
            doc_ref = self.patients_collection.document(patient_id)
            doc_ref.update({
                'status': status,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            return True
        except Exception as e:
            print(f"Error updating patient status: {e}")
            return False

    async def prioritize_patient(self, patient_id: str) -> bool:
        """Set a patient as priority."""
        try:
            doc_ref = self.patients_collection.document(patient_id)
            doc_ref.update({
                'priority': True,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            return True
        except Exception as e:
            print(f"Error prioritizing patient: {e}")
            return False

    async def delete_patient(self, patient_id: str) -> bool:
        """Delete a patient document."""
        try:
            self.patients_collection.document(patient_id).delete()
            return True
        except Exception as e:
            print(f"Error deleting patient: {e}")
            return False

    # Queue Methods
    async def check_in_patient(self, patient_id: str, queue_type: str = "check-up") -> int:
        """Check in a patient and return their token number."""
        try:
            # Get the last token number for today
            today = datetime.now().strftime("%Y-%m-%d")
            query = self.queues_collection.where('date', '==', today).where('queueType', '==', queue_type).order_by('tokenNumber', direction=firestore.Query.DESCENDING).limit(1)
            docs = query.stream()
            
            last_token = 0
            for doc in docs:
                last_token = doc.get('tokenNumber', 0)
                break
            
            new_token = last_token + 1
            
            # Create new queue entry
            doc_ref = self.queues_collection.document()
            doc_ref.set({
                'patientId': patient_id,
                'tokenNumber': new_token,
                'queueType': queue_type,
                'status': 'waiting',
                'date': today,
                'checkInTime': firestore.SERVER_TIMESTAMP,
                'estimatedWaitTime': 15
            })
            
            return new_token
        except Exception as e:
            print(f"Error checking in patient: {e}")
            raise e

    async def get_queue_patients(self) -> List[Dict[str, Any]]:
        """Get all patients in the queue."""
        try:
            today = datetime.now().strftime("%Y-%m-%d")
            docs = self.queues_collection.where('date', '==', today).where('status', '==', 'waiting').order_by('checkInTime').stream()
            return [{"id": doc.id, **doc.to_dict()} for doc in docs]
        except Exception as e:
            print(f"Error getting queue patients: {e}")
            return []

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

    async def update_queue_status(self, queue_id: str, status: str) -> bool:
        """Update the status of a queue entry."""
        try:
            doc_ref = self.queues_collection.document(queue_id)
            update_data = {
                'status': status,
                'statusUpdatedAt': firestore.SERVER_TIMESTAMP
            }
            
            if status == 'in-progress':
                update_data['startTime'] = firestore.SERVER_TIMESTAMP
            elif status == 'completed':
                update_data['endTime'] = firestore.SERVER_TIMESTAMP
            
            doc_ref.update(update_data)
            return True
        except Exception as e:
            print(f"Error updating queue status: {e}")
            return False

    # Report Methods
    async def create_report(self, report_data: Dict[str, Any]) -> str:
        """Create a new report."""
        try:
            doc_ref = self.reports_collection.document()
            report_data.update({
                'created_at': firestore.SERVER_TIMESTAMP,
                'messages': []
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

    async def get_all_reports(self) -> List[Dict[str, Any]]:
        """Get all reports."""
        try:
            docs = self.reports_collection.stream()
            return [{"id": doc.id, **doc.to_dict()} for doc in docs]
        except Exception as e:
            print(f"Error getting all reports: {e}")
            return []

    async def get_patient_reports(self, patient_id: str) -> List[Dict[str, Any]]:
        """Get all reports for a specific patient."""
        try:
            docs = self.reports_collection.where('patientId', '==', patient_id).order_by('created_at', direction=firestore.Query.DESCENDING).stream()
            return [{"id": doc.id, **doc.to_dict()} for doc in docs]
        except Exception as e:
            print(f"Error getting patient reports: {e}")
            return []

    async def send_message_to_report(self, report_id: str, message: str, sender: str) -> bool:
        """Add a message to a report."""
        try:
            doc_ref = self.reports_collection.document(report_id)
            doc = doc_ref.get()
            if not doc.exists:
                return False
            
            messages = doc.get('messages', [])
            new_message = {
                'id': os.urandom(16).hex(),
                'sender': sender,
                'content': message,
                'timestamp': firestore.SERVER_TIMESTAMP,
                'readByDoctor': sender == 'doctor',
                'readByPatient': sender == 'patient'
            }
            messages.append(new_message)
            
            doc_ref.update({'messages': messages})
            return True
        except Exception as e:
            print(f"Error sending message: {e}")
            return False

    async def get_reports_with_unread_messages(self) -> List[Dict[str, Any]]:
        """Get all reports with unread messages."""
        try:
            docs = self.reports_collection.stream()
            unread_reports = []
            
            for doc in docs:
                data = doc.to_dict()
                messages = data.get('messages', [])
                unread_count = sum(1 for msg in messages if msg.get('sender') == 'patient' and not msg.get('readByDoctor', False))
                
                if unread_count > 0:
                    patient_data = None
                    if data.get('patientId'):
                        patient_doc = self.patients_collection.document(data['patientId']).get()
                        if patient_doc.exists:
                            patient_data = patient_doc.to_dict()
                    
                    report_data = {
                        'id': doc.id,
                        'patientId': data.get('patientId'),
                        'patientName': patient_data.get('name', 'Unknown') if patient_data else 'Unknown',
                        'diagnosis': data.get('diagnosis'),
                        'created_at': data.get('created_at'),
                        'doctor': data.get('doctor'),
                        'unreadMessages': unread_count
                    }
                    unread_reports.append(report_data)
            
            return sorted(unread_reports, key=lambda x: x['unreadMessages'], reverse=True)
        except Exception as e:
            print(f"Error getting unread reports: {e}")
            return []

    async def update_report_messages(self, report_id: str, messages: List[Dict[str, Any]]) -> bool:
        """Update all messages in a report."""
        try:
            doc_ref = self.reports_collection.document(report_id)
            doc_ref.update({'messages': messages})
            return True
        except Exception as e:
            print(f"Error updating report messages: {e}")
            return False

    # Profile Methods
    async def get_patient_profile(self) -> Optional[Dict[str, Any]]:
        """Get the current patient's profile."""
        try:
            # TODO: Implement proper user authentication
            # For now, return the first patient as a demo
            docs = self.patients_collection.limit(1).stream()
            for doc in docs:
                return {"id": doc.id, **doc.to_dict()}
            return None
        except Exception as e:
            print(f"Error getting patient profile: {e}")
            return None

    async def update_profile(self, profile_data: Dict[str, Any]) -> bool:
        """Update the current patient's profile."""
        try:
            # TODO: Implement proper user authentication
            # For now, update the first patient as a demo
            docs = self.patients_collection.limit(1).stream()
            for doc in docs:
                doc.reference.update({
                    **profile_data,
                    'updated_at': firestore.SERVER_TIMESTAMP
                })
                return True
            return False
        except Exception as e:
            print(f"Error updating profile: {e}")
            return False

    # Auth Methods
    async def get_current_user_id(self) -> Optional[str]:
        """Get the current user's ID."""
        try:
            # TODO: Implement proper user authentication
            # For now, return the first patient's ID as a demo
            docs = self.patients_collection.limit(1).stream()
            for doc in docs:
                return doc.id
            return None
        except Exception as e:
            print(f"Error getting current user: {e}")
            return None 