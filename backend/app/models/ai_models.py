from pydantic import BaseModel
from typing import List, Optional

class PatientHistory(BaseModel):
    patient_name: str
    age: int
    condition: str
    symptoms: List[str]
    previous_treatments: List[str]
    last_visit: str
    allergies: Optional[List[str]] = []
    current_medications: Optional[List[str]] = []

class Recommendation(BaseModel):
    type: str
    title: str
    description: str
    priority: str
    suggested_date: Optional[str]
    reasoning: str

class AIRecommendationResponse(BaseModel):
    recommendations: List[Recommendation]
    next_appointment: str
    additional_notes: Optional[str] 