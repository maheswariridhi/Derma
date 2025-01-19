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

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Dermatology AI API",
    description="AI-powered dermatology diagnosis and treatment recommendations",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
mock_mode = os.getenv("OPENAI_API_KEY") is None
ai_orchestrator = AIOrchestrator()
dermatology_service = DermatologyAIService()

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

@app.post("/api/ai/analyze", response_model=AIRecommendationResponse)
async def analyze_patient_case(patient: PatientHistory):
    """
    Analyze patient case and provide recommendations
    """
    try:
        medical_results = await ai_orchestrator.process_patient_case(patient.model_dump())
        
        specialty_results = await dermatology_service.process_patient_case(
            patient_data=patient.model_dump(),
            medical_results=medical_results
        )
        
        # Restructure the response to match frontend expectations
        return {
            "diagnosis": {
                "primary_diagnosis": medical_results["diagnosis"]["primary_diagnosis"],
                "confidence": medical_results["diagnosis"]["confidence"],
                "differential_diagnoses": medical_results["diagnosis"]["differential_diagnoses"],
                "reasoning": medical_results["diagnosis"]["reasoning"]
            },
            "treatment_plan": {
                "recommendations": medical_results["treatment_plan"]["recommendations"],
                "next_appointment": medical_results["treatment_plan"]["follow_up"],
                "additional_notes": medical_results["medical_context"],
                "lifestyle_modifications": medical_results["treatment_plan"].get("lifestyle_modifications", [])
            },
            "specialty_insights": specialty_results,
            "confidence_score": medical_results["diagnosis"]["confidence"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/validate", response_model=ValidationResponse)
async def validate_recommendation(recommendation: Recommendation):
    """
    Validate a medical recommendation
    
    Parameters:
    - type: str
    - title: str
    - description: str
    - priority: str
    - reasoning: str
    - confidence: float
    """
    try:
        validation_result = await dermatology_service.validator.validate_recommendation(
            recommendation.model_dump()
        )
        return validation_result
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
