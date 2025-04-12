from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from datetime import datetime
from app.services.firebase_service import FirebaseService

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Dermatology API",
    description="Dermatology patient management system",
    version="1.0.0",
)

# Update CORS settings to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOW_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(","),  # Vite's default ports
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Initialize Firebase service
firebase_service = FirebaseService()

# Request/Response Models
class PatientCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None

class PatientUpdate(BaseModel):
    status: str

class PatientProfile(BaseModel):
    name: str
    email: str
    phone: str
    dateOfBirth: str
    address: str

class QueueEntry(BaseModel):
    patientId: str
    queueType: str = "check-up"

class Message(BaseModel):
    message: str
    sender: str

class Report(BaseModel):
    patientId: str
    diagnosis: Optional[str] = None
    diagnosisDetails: Optional[str] = None
    medications: Optional[List[Dict[str, str]]] = None
    nextSteps: Optional[List[str]] = None
    next_appointment: Optional[str] = None
    recommendations: Optional[List[Any]] = None
    additional_notes: Optional[str] = None
    selectedTreatments: Optional[List[Any]] = None
    selectedMedicines: Optional[List[Any]] = None
    doctor: Optional[str] = None

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500, content={"detail": str(exc), "path": str(request.url.path)}
    )

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {"firebase": "running"},
    }

# Patient Endpoints
@app.post("/api/patients")
async def create_patient(patient: PatientCreate):
    print("Received create patient request:", patient.dict())
    result = await firebase_service.create_patient(patient.dict())
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.get("/api/patients/{identifier}")
async def get_patient(identifier: str):
    patient = await firebase_service.get_patient(identifier)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@app.put("/api/patients/{patient_id}")
async def update_patient(patient_id: str, patient_data: dict):
    result = await firebase_service.update_patient(patient_id, patient_data)
    if not result:
        raise HTTPException(status_code=404, detail="Patient not found")
    return result

@app.get("/api/patients")
async def get_all_patients():
    print("Received get all patients request")
    try:
        patients = await firebase_service.get_all_patients()
        return patients
    except Exception as e:
        print(f"Error in get_all_patients endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/patients/{patient_id}/status")
async def update_patient_status(patient_id: str, update: PatientUpdate):
    result = await firebase_service.update_patient_status(patient_id, update.status)
    if not result:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"success": True}

@app.put("/api/patients/{patient_id}/priority")
async def prioritize_patient(patient_id: str):
    result = await firebase_service.prioritize_patient(patient_id)
    if not result:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"success": True}

@app.delete("/api/patients/{patient_id}")
async def delete_patient(patient_id: str):
    result = await firebase_service.delete_patient(patient_id)
    if not result:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"success": True}

# Queue Endpoints
@app.post("/api/queue/check-in")
async def check_in_patient(entry: QueueEntry):
    token = await firebase_service.check_in_patient(entry.patientId, entry.queueType)
    return {"tokenNumber": token}

@app.get("/api/queue/patients")
async def get_queue_patients():
    return await firebase_service.get_queue_patients()

@app.get("/api/queue/status")
async def get_queue_status():
    return await firebase_service.get_queue_status()

@app.put("/api/queue/{queue_id}/status")
async def update_queue_status(queue_id: str, update: PatientUpdate):
    await firebase_service.update_queue_status(queue_id, update.status)
    return {"success": True}

# Report Endpoints
@app.post("/api/reports")
async def create_report(report: Report):
    result = await firebase_service.create_report(report)
    return {"id": result}

@app.get("/api/reports")
async def get_all_reports():
    return await firebase_service.get_all_reports()

@app.get("/api/reports/{report_id}")
async def get_report(report_id: str):
    report = await firebase_service.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@app.get("/api/patients/{patient_id}/reports")
async def get_patient_reports(patient_id: str):
    return await firebase_service.get_patient_reports(patient_id)

@app.post("/api/reports/{report_id}/messages")
async def send_message(report_id: str, message: Message):
    result = await firebase_service.send_message_to_report(
        report_id, message.message, message.sender
    )
    if not result:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"success": True}

@app.get("/api/reports/unread")
async def get_unread_reports():
    return await firebase_service.get_reports_with_unread_messages()

@app.put("/api/reports/{report_id}/messages")
async def update_report_messages(report_id: str, messages: List[Dict[str, Any]]):
    result = await firebase_service.update_report_messages(report_id, messages)
    if not result:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"success": True}

# Profile Endpoints
@app.get("/api/patients/profile")
async def get_patient_profile():
    profile = await firebase_service.get_patient_profile()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@app.put("/api/patients/profile")
async def update_profile(profile: PatientProfile):
    result = await firebase_service.update_profile(profile.dict())
    if not result:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"success": True}

# Auth Endpoints
@app.get("/api/auth/current-user")
async def get_current_user():
    user_id = await firebase_service.get_current_user_id()
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"userId": user_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
