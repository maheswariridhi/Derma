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

# Models for Treatments and Medicines
class TreatmentCreate(BaseModel):
    name: str
    description: str
    duration: int
    price: float
    category: str

class TreatmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[int] = None
    price: Optional[float] = None
    category: Optional[str] = None

class MedicineCreate(BaseModel):
    name: str
    description: str
    dosage: str
    price: float
    unit: str
    stock: int

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    dosage: Optional[str] = None
    price: Optional[float] = None
    unit: Optional[str] = None
    stock: Optional[int] = None

class StockUpdate(BaseModel):
    quantity: int

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
    """Create a new patient."""
    print("Received create patient request:", patient.dict())
    result = await firebase_service.create_patient(patient.dict())
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.post("/api/patients/register")
async def register_patient(patient: PatientCreate):
    """Register a new patient."""
    print("Received patient registration request:", patient.dict())
    result = await firebase_service.create_patient(patient.dict())
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.get("/api/patients/{identifier}")
async def get_patient(identifier: str):
    """Get a patient by ID."""
    patient = await firebase_service.get_patient(identifier)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@app.get("/api/patients")
async def get_all_patients():
    """Get all patients."""
    print("Received get all patients request")
    try:
        patients = await firebase_service.get_all_patients()
        return patients
    except Exception as e:
        print(f"Error in get_all_patients endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/patients/{patient_id}")
async def update_patient(patient_id: str, patient_data: dict):
    """Update a patient's data."""
    result = await firebase_service.update_patient(patient_id, patient_data)
    if not result:
        raise HTTPException(status_code=404, detail="Patient not found")
    return result

@app.delete("/api/patients/{patient_id}")
async def delete_patient(patient_id: str):
    """Delete a patient."""
    result = await firebase_service.delete_patient(patient_id)
    if not result:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"success": True}

# Report Endpoints
@app.post("/api/reports")
async def create_report(report: Report):
    """Create a new report."""
    result = await firebase_service.create_report(report.dict())
    return {"id": result}

@app.get("/api/reports/{report_id}")
async def get_report(report_id: str):
    """Get a report by ID."""
    report = await firebase_service.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@app.get("/api/patients/{patient_id}/reports")
async def get_patient_reports(patient_id: str):
    """Get all reports for a specific patient."""
    return await firebase_service.get_patient_reports(patient_id)

# Treatment Endpoints
@app.post("/api/treatments")
async def create_treatment(treatment: TreatmentCreate):
    """Create a new treatment."""
    result = await firebase_service.create_treatment(treatment.dict())
    return result

@app.get("/api/treatments/{treatment_id}")
async def get_treatment(treatment_id: str):
    """Get a treatment by ID."""
    treatment = await firebase_service.get_treatment(treatment_id)
    if not treatment:
        raise HTTPException(status_code=404, detail="Treatment not found")
    return treatment

@app.get("/api/treatments")
async def get_all_treatments():
    """Get all active treatments."""
    return await firebase_service.get_all_treatments()

@app.put("/api/treatments/{treatment_id}")
async def update_treatment(treatment_id: str, treatment: TreatmentUpdate):
    """Update a treatment."""
    result = await firebase_service.update_treatment(treatment_id, treatment.dict(exclude_unset=True))
    if not result:
        raise HTTPException(status_code=404, detail="Treatment not found")
    return result

@app.delete("/api/treatments/{treatment_id}")
async def delete_treatment(treatment_id: str):
    """Delete a treatment."""
    result = await firebase_service.delete_treatment(treatment_id)
    if not result:
        raise HTTPException(status_code=404, detail="Treatment not found")
    return {"success": True}

# Medicine Endpoints
@app.post("/api/medicines")
async def create_medicine(medicine: MedicineCreate):
    """Create a new medicine."""
    result = await firebase_service.create_medicine(medicine.dict())
    return result

@app.get("/api/medicines/{medicine_id}")
async def get_medicine(medicine_id: str):
    """Get a medicine by ID."""
    medicine = await firebase_service.get_medicine(medicine_id)
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return medicine

@app.get("/api/medicines")
async def get_all_medicines():
    """Get all active medicines."""
    return await firebase_service.get_all_medicines()

@app.put("/api/medicines/{medicine_id}")
async def update_medicine(medicine_id: str, medicine: MedicineUpdate):
    """Update a medicine."""
    result = await firebase_service.update_medicine(medicine_id, medicine.dict(exclude_unset=True))
    if not result:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return result

@app.delete("/api/medicines/{medicine_id}")
async def delete_medicine(medicine_id: str):
    """Delete a medicine."""
    result = await firebase_service.delete_medicine(medicine_id)
    if not result:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return {"success": True}

@app.put("/api/medicines/{medicine_id}/stock")
async def update_medicine_stock(medicine_id: str, stock_update: StockUpdate):
    """Update medicine stock quantity."""
    result = await firebase_service.update_medicine_stock(medicine_id, stock_update.quantity)
    if not result:
        raise HTTPException(status_code=404, detail="Medicine not found or invalid stock update")
    return {"success": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
