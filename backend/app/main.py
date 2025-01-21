from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.services.ai_orchestrator import AIOrchestrator
from app.services.ai_service import DermatologyAIService
from app.models.ai_models import (
    PatientHistory, 
    AIRecommendationResponse,
    ValidationResponse,
    Recommendation
)
from typing import Dict, Any, List, Optional
import os
from dotenv import load_dotenv
from datetime import datetime
from app.services.firebase_service import FirebaseService
from pydantic import BaseModel, Field, EmailStr

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Dermatology AI API",
    description="AI-powered dermatology diagnosis and treatment recommendations",
    version="1.0.0"
)

# Update CORS settings to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Initialize services
mock_mode = os.getenv("OPENAI_API_KEY") is None
ai_orchestrator = AIOrchestrator()
dermatology_service = DermatologyAIService()
firebase_service = FirebaseService()

class PatientData(BaseModel):
    patient_name: str
    age: int
    condition: str
    symptoms: List[str]
    previous_treatments: List[str]
    last_visit: str
    allergies: Optional[List[str]] = []
    current_medications: Optional[List[str]] = []
    medical_history: Optional[str] = None

class AnalysisResponse(BaseModel):
    recommendations: str
    next_appointment: str
    confidence_score: float
    medical_context: Optional[str] = None

class RecommendationRequest(BaseModel):
    recommendation: str

class PatientCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "path": str(request.url.path)}
    )

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "mock_mode": mock_mode,
        "services": {
            "orchestrator": "running",
            "dermatology": "running"
        }
    }

@app.post("/api/ai/analyze", response_model=AnalysisResponse)
async def analyze_patient_data(patient_data: PatientData):
    try:
        result = await dermatology_service.process_patient_case(patient_data.model_dump())
        return {
            "recommendations": result["treatment_plan"]["recommendations"],
            "next_appointment": result["treatment_plan"]["next_appointment"],
            "confidence_score": result["confidence_score"],
            "medical_context": result.get("medical_context")
        }
    except Exception as e:
        print(f"Error in analyze_patient_data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/validate")
async def validate_recommendation(request: RecommendationRequest):
    try:
        result = await dermatology_service.validate_recommendation({
            "recommendation": request.recommendation
        })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/feedback")
async def add_feedback(
    recommendation_id: str,
    feedback_type: str,
    feedback_text: str,
    rating: int
):
    """
    Add feedback for a recommendation
    
    Parameters:
    - recommendation_id: str (UUID of the recommendation)
    - feedback_type: str (positive/negative/suggestion)
    - feedback_text: str (detailed feedback)
    - rating: int (1-5 rating)
    """
    try:
        feedback_data = {
            "recommendation_id": recommendation_id,
            "feedback_type": feedback_type,
            "feedback_text": feedback_text,
            "rating": rating,
            "timestamp": datetime.now().isoformat()
        }
        return {"status": "success", "message": "Feedback recorded", "data": feedback_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/analyze/{patient_id}", response_model=AnalysisResponse)
async def analyze_patient(patient_id: str):
    try:
        result = await dermatology_service.analyze_patient(patient_id)
        return {
            "recommendations": result["treatment_plan"]["recommendations"],
            "next_appointment": result["treatment_plan"]["next_appointment"],
            "confidence_score": result["confidence_score"],
            "medical_context": result.get("medical_context")
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"Error in analyze_patient: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/patients")
async def create_patient(patient: PatientCreate):
    print("Received create patient request:", patient.dict())  # Debug log
    try:
        result = await firebase_service.create_patient(patient.dict())
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        print(f"Error in create_patient endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/patients/{identifier}")
async def get_patient(identifier: str):
    patient = await firebase_service.get_patient(identifier)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@app.get("/api/patients")
async def get_all_patients():
    print("Received get all patients request")  # Debug log
    try:
        patients = await firebase_service.get_all_patients()
        print("Returning patients:", patients)
        return patients
    except Exception as e:
        print(f"Error in get_all_patients endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
