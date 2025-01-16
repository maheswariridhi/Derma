from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.services.ai_service import DermatologyAIService
from app.models.ai_models import PatientHistory
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/ai/recommendations")
async def get_recommendations(patient_data: PatientHistory):
    try:
        ai_service = DermatologyAIService()
        recommendations = await ai_service.generate_recommendations(patient_data)
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "DermaAI API is running"}

@app.post("/api/rag/query")
async def query_knowledge(query: str, context: dict = None):
    try:
        ai_service = DermatologyAIService()
        results = await ai_service.search_knowledge(query, context or {})
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rag/services")
async def search_services(query: str):
    try:
        ai_service = DermatologyAIService()
        results = await ai_service.search_clinic_services(query)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rag/medical")
async def search_medical(query: str):
    try:
        ai_service = DermatologyAIService()
        results = await ai_service.search_medical_knowledge(query)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agent/schedule")
async def schedule_appointment(patient_data: dict, preferred_time: str):
    try:
        ai_service = DermatologyAIService()
        result = await ai_service.schedule_appointment(patient_data, preferred_time)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agent/follow-up")
async def handle_follow_up(patient_data: dict):
    try:
        ai_service = DermatologyAIService()
        result = await ai_service.handle_follow_up(patient_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agent/treatment-plan")
async def manage_treatment_plan(patient_data: dict, current_plan: dict):
    try:
        ai_service = DermatologyAIService()
        result = await ai_service.manage_treatment(patient_data, current_plan)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/knowledge/search")
async def search_knowledge(query: str, type: str = "dermatology"):
    try:
        ai_service = DermatologyAIService()
        results = await ai_service.search_knowledge_base(query, type)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/knowledge/conditions/{condition}")
async def get_condition_info(condition: str):
    try:
        ai_service = DermatologyAIService()
        info = await ai_service.get_condition_details(condition)
        return info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/knowledge/treatments/{treatment}")
async def get_treatment_guidelines(treatment: str):
    try:
        ai_service = DermatologyAIService()
        guidelines = await ai_service.get_treatment_guidelines(treatment)
        return guidelines
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=3001)
