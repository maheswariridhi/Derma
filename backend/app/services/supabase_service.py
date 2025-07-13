import os
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging
from dotenv import load_dotenv
from supabase import create_client
import json
from fastapi import HTTPException

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class SupabaseService:
    def __init__(self):
        try:
            # Initialize Supabase client
            logger.info("Initializing Supabase client...")
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_SECRET_KEY")  # Use service role key for full access
            
            if not supabase_url or not supabase_key:
                raise ValueError("Missing Supabase credentials. Check environment variables.")
            
            # Simplified initialization without proxy parameter
            self.supabase = create_client(supabase_url, supabase_key)
            logger.info("Supabase client initialized successfully with service role")
            
            # Default hospital ID
            self.hospital_id = 'hospital_dermai_01'
            
        except Exception as e:
            logger.error(f"Error initializing Supabase: {str(e)}")
            raise e

    # Patient Methods
    async def create_patient(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new patient in the database."""
        try:
            # Prepare the data
            current_time = datetime.now().isoformat()
            new_patient = {
                **patient_data,
                'hospital_id': self.hospital_id,
                'created_at': current_time,
                'updated_at': current_time,
                'status': 'active'
            }
            
            # Insert into database
            result = self.supabase.table('patients').insert(new_patient).execute()
            
            if len(result.data) == 0:
                raise HTTPException(status_code=500, detail="Failed to create patient")
                
            # Return the created patient
            created_patient = result.data[0]
            return created_patient
            
        except Exception as e:
            logger.error(f"Error creating patient: {str(e)}")
            return {"error": str(e)}

    async def get_patient(self, patient_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a patient by ID."""
        try:
            result = self.supabase.table('patients')\
                .select('*')\
                .eq('id', patient_id)\
                .eq('hospital_id', self.hospital_id)\
                .execute()
                
            if len(result.data) == 0:
                return None
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error getting patient: {str(e)}")
            return None

    async def get_all_patients(self) -> List[Dict[str, Any]]:
        """Retrieve all patients."""
        try:
            logger.info("Fetching all patients from Supabase")
            logger.info(f"Using hospital_id: {self.hospital_id}")
            
            # Build and print the query
            query = self.supabase.table('patients').select('*').eq('hospital_id', self.hospital_id)
            logger.info(f"Executing query against Supabase...")
            
            # Execute the query
            result = query.execute()
            
            logger.info(f"Query complete. Retrieved {len(result.data)} patients.")
            
            # Log each patient ID for debugging
            for patient in result.data:
                logger.info(f"Patient found: ID={patient.get('id')}, Name={patient.get('name')}")
                
            return result.data
        except Exception as e:
            logger.error(f"Error getting all patients: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return []

    async def update_patient(self, patient_id: str, patient_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a patient record."""
        try:
            # Remove any None values from the update data
            update_data = {k: v for k, v in patient_data.items() if v is not None}
            update_data['updated_at'] = datetime.now().isoformat()
            
            result = self.supabase.table('patients')\
                .update(update_data)\
                .eq('id', patient_id)\
                .eq('hospital_id', self.hospital_id)\
                .execute()
                
            if len(result.data) == 0:
                return None
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error updating patient: {str(e)}")
            return None

    async def delete_patient(self, patient_id: str) -> bool:
        """Delete a patient from the database."""
        try:
            logger.info(f"Deleting patient with ID: {patient_id}")
            
            result = self.supabase.table('patients')\
                .delete()\
                .eq('id', patient_id)\
                .eq('hospital_id', self.hospital_id)\
                .execute()
                
            return True
        except Exception as e:
            logger.error(f"Error deleting patient: {str(e)}")
            return False

    # Report Methods
    async def create_report(self, report_data: Dict[str, Any]) -> str:
        """Create a new report."""
        try:
            # Prepare the data
            current_time = datetime.now().isoformat()
            new_report = {
                **report_data,
                'hospital_id': self.hospital_id,
                'created_at': current_time,
                'updated_at': current_time
            }
            # Convert patientId to patientid for database consistency
            if 'patientId' in new_report:
                new_report['patientid'] = new_report.pop('patientId')
            # ai_summary and ai_explanation are included if present in report_data
            result = self.supabase.table('reports').insert(new_report).execute()
            if len(result.data) == 0:
                raise HTTPException(status_code=500, detail="Failed to create report")
            return result.data[0]['id']
        except Exception as e:
            logger.error(f"Error creating report: {str(e)}")
            raise e

    async def get_report(self, report_id: str) -> Optional[Dict[str, Any]]:
        """Get a report by ID."""
        try:
            result = self.supabase.table('reports')\
                .select('*')\
                .eq('id', report_id)\
                .eq('hospital_id', self.hospital_id)\
                .execute()
                
            if len(result.data) == 0:
                return None
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error getting report: {str(e)}")
            return None

    async def get_patient_reports(self, patient_id: str) -> List[Dict[str, Any]]:
        """Get all reports for a specific patient."""
        try:
            result = self.supabase.table('reports')\
                .select('*')\
                .eq('patientid', patient_id)\
                .eq('hospital_id', self.hospital_id)\
                .order('created_at', desc=True)\
                .execute()
                
            return result.data
        except Exception as e:
            logger.error(f"Error getting patient reports: {str(e)}")
            return []

    # Treatment Methods
    async def create_treatment(self, treatment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new treatment."""
        try:
            logger.info(f"Creating treatment: {treatment_data}")
            
            # Prepare the data
            current_time = datetime.now().isoformat()
            new_treatment = {
                **treatment_data,
                'hospital_id': self.hospital_id,
                'created_at': current_time,
                'updated_at': current_time
            }
            
            result = self.supabase.table('treatments').insert(new_treatment).execute()
            
            if len(result.data) == 0:
                raise HTTPException(status_code=500, detail="Failed to create treatment")
                
            logger.info(f"Treatment created with ID: {result.data[0]['id']}")
            return result.data[0]
        except Exception as e:
            logger.error(f"Error creating treatment: {str(e)}")
            raise e

    async def get_treatment(self, treatment_id: str) -> Optional[Dict[str, Any]]:
        """Get a treatment by ID."""
        try:
            result = self.supabase.table('treatments')\
                .select('*')\
                .eq('id', treatment_id)\
                .eq('hospital_id', self.hospital_id)\
                .execute()
                
            if len(result.data) == 0:
                return None
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error getting treatment: {str(e)}")
            return None

    async def get_all_treatments(self) -> List[Dict[str, Any]]:
        """Get all treatments."""
        try:
            logger.info("Fetching all treatments")
            
            result = self.supabase.table('treatments')\
                .select('*')\
                .eq('hospital_id', self.hospital_id)\
                .execute()
                
            logger.info(f"Found {len(result.data)} treatments")
            return result.data
        except Exception as e:
            logger.error(f"Error getting all treatments: {str(e)}")
            raise e

    async def update_treatment(self, treatment_id: str, treatment_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a treatment."""
        try:
            # Remove any None values from the update data
            update_data = {k: v for k, v in treatment_data.items() if v is not None}
            update_data['updated_at'] = datetime.now().isoformat()
            
            result = self.supabase.table('treatments')\
                .update(update_data)\
                .eq('id', treatment_id)\
                .eq('hospital_id', self.hospital_id)\
                .execute()
                
            if len(result.data) == 0:
                return None
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error updating treatment: {str(e)}")
            return None

    async def delete_treatment(self, treatment_id: str) -> bool:
        """Delete a treatment from the database."""
        try:
            result = self.supabase.table('treatments')\
                .delete()\
                .eq('id', treatment_id)\
                .eq('hospital_id', self.hospital_id)\
                .execute()
                
            return True
        except Exception as e:
            logger.error(f"Error deleting treatment: {str(e)}")
            return False

    # Medicine Methods
    async def create_medicine(self, medicine_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new medicine."""
        try:
            logger.info(f"Creating medicine: {medicine_data}")
            
            # Prepare the data
            current_time = datetime.now().isoformat()
            new_medicine = {
                **medicine_data,
                'hospital_id': self.hospital_id,
                'created_at': current_time,
                'updated_at': current_time
            }
            
            result = self.supabase.table('medicines').insert(new_medicine).execute()
            
            if len(result.data) == 0:
                raise HTTPException(status_code=500, detail="Failed to create medicine")
                
            logger.info(f"Medicine created with ID: {result.data[0]['id']}")
            return result.data[0]
        except Exception as e:
            logger.error(f"Error creating medicine: {str(e)}")
            raise e

    async def get_medicine(self, medicine_id: str) -> Optional[Dict[str, Any]]:
        """Get a medicine by ID."""
        try:
            result = self.supabase.table('medicines')\
                .select('*')\
                .eq('id', medicine_id)\
                .eq('hospital_id', self.hospital_id)\
                .execute()
                
            if len(result.data) == 0:
                return None
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error getting medicine: {str(e)}")
            return None

    async def get_all_medicines(self) -> List[Dict[str, Any]]:
        """Get all medicines."""
        try:
            logger.info("Fetching all medicines")
            
            result = self.supabase.table('medicines')\
                .select('*')\
                .eq('hospital_id', self.hospital_id)\
                .execute()
                
            logger.info(f"Found {len(result.data)} medicines")
            return result.data
        except Exception as e:
            logger.error(f"Error getting all medicines: {str(e)}")
            raise e

    async def update_medicine(self, medicine_id: str, medicine_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a medicine."""
        try:
            # Remove any None values from the update data
            update_data = {k: v for k, v in medicine_data.items() if v is not None}
            update_data['updated_at'] = datetime.now().isoformat()
            
            result = self.supabase.table('medicines')\
                .update(update_data)\
                .eq('id', medicine_id)\
                .eq('hospital_id', self.hospital_id)\
                .execute()
                
            if len(result.data) == 0:
                return None
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error updating medicine: {str(e)}")
            return None

    async def delete_medicine(self, medicine_id: str) -> bool:
        """Delete a medicine from the database."""
        try:
            result = self.supabase.table('medicines')\
                .delete()\
                .eq('id', medicine_id)\
                .eq('hospital_id', self.hospital_id)\
                .execute()
                
            return True
        except Exception as e:
            logger.error(f"Error deleting medicine: {str(e)}")
            return False

    async def update_medicine_stock(self, medicine_id: str, quantity: int) -> bool:
        """Update medicine stock quantity."""
        try:
            medicine = await self.get_medicine(medicine_id)
            if not medicine:
                return False
                
            current_stock = medicine.get('stock', 0)
            new_stock = current_stock + quantity
            
            if new_stock < 0:
                return False
                
            result = self.supabase.table('medicines')\
                .update({'stock': new_stock, 'updated_at': datetime.now().isoformat()})\
                .eq('id', medicine_id)\
                .eq('hospital_id', self.hospital_id)\
                .execute()
                
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"Error updating medicine stock: {str(e)}")
            return False

    # Doctor Methods
    async def create_doctor(self, hospital_id: str, doctor_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new doctor."""
        try:
            # Prepare the data
            current_time = datetime.now().isoformat()
            new_doctor = {
                **doctor_data,
                'hospital_id': hospital_id,
                'created_at': current_time,
                'updated_at': current_time
            }
            
            result = self.supabase.table('doctors').insert(new_doctor).execute()
            
            if len(result.data) == 0:
                raise HTTPException(status_code=500, detail="Failed to create doctor")
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error creating doctor: {str(e)}")
            raise e

    async def get_all_doctors(self, hospital_id: str) -> List[Dict[str, Any]]:
        """Get all doctors for a hospital."""
        try:
            result = self.supabase.table('doctors')\
                .select('*')\
                .eq('hospital_id', hospital_id)\
                .execute()
                
            return result.data
        except Exception as e:
            logger.error(f"Error getting doctors: {str(e)}")
            return []

    # Treatment Info Methods
    async def get_treatment_info(self, item_type: str, item_id: str) -> Optional[Dict[str, Any]]:
        """Get treatment info by item type and ID."""
        try:
            result = self.supabase.table('treatment_info')\
                .select('*')\
                .eq('item_type', item_type)\
                .eq('item_id', item_id)\
                .eq('hospital_id', self.hospital_id)\
                .execute()
                
            if len(result.data) == 0:
                return None
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error getting treatment info: {str(e)}")
            return None

    async def create_treatment_info(self, treatment_info_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new treatment info entry."""
        try:
            # Prepare the data
            current_time = datetime.now().isoformat()
            new_treatment_info = {
                **treatment_info_data,
                'hospital_id': self.hospital_id,
                'created_at': current_time,
                'updated_at': current_time
            }
            
            result = self.supabase.table('treatment_info').insert(new_treatment_info).execute()
            
            if len(result.data) == 0:
                raise HTTPException(status_code=500, detail="Failed to create treatment info")
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error creating treatment info: {str(e)}")
            raise e

    async def update_treatment_info(self, item_type: str, item_id: str, explanation: str) -> Optional[Dict[str, Any]]:
        """Update treatment info explanation."""
        try:
            update_data = {
                'explanation': explanation,
                'updated_at': datetime.now().isoformat()
            }
            
            result = self.supabase.table('treatment_info')\
                .update(update_data)\
                .eq('item_type', item_type)\
                .eq('item_id', item_id)\
                .eq('hospital_id', self.hospital_id)\
                .execute()
                
            if len(result.data) == 0:
                return None
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error updating treatment info: {str(e)}")
            return None 