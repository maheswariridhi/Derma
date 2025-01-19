from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class PatientHistory(BaseModel):
    patient_name: str
    age: int
    condition: str
    symptoms: List[str]
    previous_treatments: List[str]
    last_visit: str
    allergies: Optional[List[str]] = []
    current_medications: Optional[List[str]] = []
    medical_history: Optional[str] = None

class Recommendation(BaseModel):
    type: str
    title: str
    description: str
    priority: str
    suggested_date: Optional[str] = None
    reasoning: str
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)

class AIRecommendationResponse(BaseModel):
    recommendations: List[Recommendation]
    next_appointment: str
    additional_notes: Optional[str] = None
    medical_context: Optional[str] = None
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)
    created_at: datetime = Field(default_factory=datetime.now)

class ValidationResponse(BaseModel):
    is_valid: bool
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    warnings: List[str] = []
    suggestions: List[str] = []
    validation_timestamp: datetime = Field(default_factory=datetime.now)

class FeedbackData(BaseModel):
    recommendation_id: str
    patient_outcome: str
    doctor_notes: Optional[str] = None
    treatment_adjustments: List[str] = []
    effectiveness_score: float = Field(default=0.0, ge=0.0, le=1.0)
    feedback_timestamp: datetime = Field(default_factory=datetime.now) 