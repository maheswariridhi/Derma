from fastapi import FastAPI, HTTPException, Request, Depends, Header, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from datetime import datetime
from app.services.supabase_service import SupabaseService
from app.services.ai_service import AIService
from app.services.vector_db_service import VectorDBService
import jwt
import aiofiles

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Dermatology API",
    description="Dermatology patient management system with AI-powered medical document understanding and chatbot",
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

# Initialize services
supabase_service = SupabaseService()
vector_db_service = VectorDBService()
ai_service = AIService(vector_db_service, os.getenv("ANTHROPIC_API_KEY", ""))

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
    ai_summary: Optional[str] = None
    ai_explanation: Optional[str] = None

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

class DoctorCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    speciality: Optional[str] = None
    experience: Optional[str] = None
    bio: Optional[str] = None

class TreatmentInfoRequest(BaseModel):
    item_type: str  # 'treatment' or 'medicine'
    item_id: str

# New models for medical documents and chatbot
class MedicalDocumentRequest(BaseModel):
    content: str
    document_type: str = "medical_document"
    patient_id: Optional[str] = None
    doctor_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    message: str
    user_id: str
    session_id: Optional[str] = None
    patient_id: Optional[str] = None

class DocumentAnalysisRequest(BaseModel):
    content: str
    document_type: str = "report"

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500, content={"detail": str(exc), "path": str(request.url.path)}
    )

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        vector_stats = await ai_service.get_vector_db_stats()
        return {
            "status": "healthy",
            "services": {
                "supabase": "running",
                "vector_db": "running" if "error" not in vector_stats else "error"
            },
            "vector_db_stats": vector_stats
        }
    except Exception as e:
        return {
            "status": "degraded",
            "services": {
                "supabase": "running",
                "vector_db": "error"
            },
            "error": str(e)
        }

# Patient Endpoints
@app.get("/api/patients/profile")
async def get_patient_profile(Authorization: Optional[str] = Header(None)):
    try:
        if not Authorization:
            raise HTTPException(status_code=401, detail="Authorization header required")
        
        print(f"Authorization header: {Authorization}")  # Debug log
        token = Authorization.split(" ")[-1]
        print(f"Extracted token: {token}")  # Debug log
        decoded = jwt.decode(token, options={"verify_signature": False})
        print(f"Decoded JWT: {decoded}")  # Debug log
        user_id = decoded.get("sub")
        print(f"Extracted user_id: {user_id}")  # Debug log
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: no user id")
        patient = await supabase_service.get_patient(user_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        return patient
    except Exception as e:
        print(f"Exception in get_patient_profile: {e}")  # Debug log
        raise HTTPException(status_code=401, detail=f"Could not get patient profile: {str(e)}")

@app.get("/api/patients/{identifier}")
async def get_patient(identifier: str):
    """Get a patient by ID."""
    patient = await supabase_service.get_patient(identifier)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@app.get("/api/patients")
async def get_all_patients():
    """Get all patients."""
    try:
        patients = await supabase_service.get_all_patients()
        return patients
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/patients")
async def create_patient(patient: PatientCreate):
    """Create a new patient."""
    result = await supabase_service.create_patient(patient.dict())
    if not result or "error" in result:
        raise HTTPException(status_code=500, detail="Failed to create patient")
    return {"id": result["id"]}

@app.put("/api/patients/{patient_id}")
async def update_patient(patient_id: str, patient_data: dict):
    """Update a patient's data."""
    result = await supabase_service.update_patient(patient_id, patient_data)
    if not result:
        raise HTTPException(status_code=404, detail="Patient not found")
    return result

@app.delete("/api/patients/{patient_id}")
async def delete_patient(patient_id: str):
    """Delete a patient."""
    result = await supabase_service.delete_patient(patient_id)
    if not result:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"success": True}

# Report Endpoints
@app.post("/api/reports")
async def create_report(report: Report):
    """Create a new report."""
    result = await supabase_service.create_report(report.dict())
    return {"id": result}

@app.get("/api/reports/{report_id}")
async def get_report(report_id: str):
    """Get a report by ID."""
    report = await supabase_service.get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@app.get("/api/patients/{patient_id}/reports")
async def get_patient_reports(patient_id: str):
    """Get all reports for a specific patient."""
    return await supabase_service.get_patient_reports(patient_id)

# Treatment Endpoints
@app.post("/api/treatments")
async def create_treatment(treatment: TreatmentCreate):
    """Create a new treatment."""
    result = await supabase_service.create_treatment(treatment.dict())
    return result

@app.get("/api/treatments/{treatment_id}")
async def get_treatment(treatment_id: str):
    """Get a treatment by ID."""
    treatment = await supabase_service.get_treatment(treatment_id)
    if not treatment:
        raise HTTPException(status_code=404, detail="Treatment not found")
    return treatment

@app.get("/api/treatments")
async def get_all_treatments():
    """Get all active treatments."""
    return await supabase_service.get_all_treatments()

@app.put("/api/treatments/{treatment_id}")
async def update_treatment(treatment_id: str, treatment: TreatmentUpdate):
    """Update a treatment."""
    result = await supabase_service.update_treatment(treatment_id, treatment.dict(exclude_unset=True))
    if not result:
        raise HTTPException(status_code=404, detail="Treatment not found")
    return result

@app.delete("/api/treatments/{treatment_id}")
async def delete_treatment(treatment_id: str):
    """Delete a treatment."""
    success = await supabase_service.delete_treatment(treatment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Treatment not found")
    return {"success": True}

# Medicine Endpoints
@app.post("/api/medicines")
async def create_medicine(medicine: MedicineCreate):
    """Create a new medicine."""
    result = await supabase_service.create_medicine(medicine.dict())
    return result

@app.get("/api/medicines/{medicine_id}")
async def get_medicine(medicine_id: str):
    """Get a medicine by ID."""
    medicine = await supabase_service.get_medicine(medicine_id)
    if not medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return medicine

@app.get("/api/medicines")
async def get_all_medicines():
    """Get all active medicines."""
    return await supabase_service.get_all_medicines()

@app.put("/api/medicines/{medicine_id}")
async def update_medicine(medicine_id: str, medicine: MedicineUpdate):
    """Update a medicine."""
    result = await supabase_service.update_medicine(medicine_id, medicine.dict(exclude_unset=True))
    if not result:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return result

@app.delete("/api/medicines/{medicine_id}")
async def delete_medicine(medicine_id: str):
    """Delete a medicine."""
    success = await supabase_service.delete_medicine(medicine_id)
    if not success:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return {"success": True}

@app.put("/api/medicines/{medicine_id}/stock")
async def update_medicine_stock(medicine_id: str, stock_update: StockUpdate):
    """Update medicine stock."""
    success = await supabase_service.update_medicine_stock(medicine_id, stock_update.quantity)
    if not success:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return {"success": True}

@app.post("/api/hospitals/{hospital_id}/doctors")
async def create_doctor(hospital_id: str, doctor: DoctorCreate):
    """Create a new doctor for a hospital."""
    result = await supabase_service.create_doctor(hospital_id, doctor.dict())
    return result

@app.get("/api/hospitals/{hospital_id}/doctors")
async def get_all_doctors(hospital_id: str):
    """Get all doctors for a hospital."""
    return await supabase_service.get_all_doctors(hospital_id)

# Treatment Info Endpoints
@app.get("/api/treatment-info/{item_type}/{item_id}")
async def get_treatment_info(item_type: str, item_id: str):
    """Get educational content for a treatment or medicine."""
    try:
        # Validate item_type
        if item_type not in ['treatment', 'medicine']:
            raise HTTPException(status_code=400, detail="Invalid item_type. Must be 'treatment' or 'medicine'")
        
        # Check if explanation already exists
        existing_info = await supabase_service.get_treatment_info(item_type, item_id)
        
        if existing_info:
            return existing_info
        
        # If no existing info, generate it
        if item_type == 'treatment':
            treatment = await supabase_service.get_treatment(item_id)
            if not treatment:
                raise HTTPException(status_code=404, detail="Treatment not found")
            
            explanation = await ai_service.generate_treatment_explanation(treatment)
            
            # Store the generated explanation
            treatment_info_data = {
                'item_type': item_type,
                'item_id': item_id,
                'item_name': treatment['name'],
                'explanation': explanation
            }
            
            result = await supabase_service.create_treatment_info(treatment_info_data)
            return result
            
        elif item_type == 'medicine':
            medicine = await supabase_service.get_medicine(item_id)
            if not medicine:
                raise HTTPException(status_code=404, detail="Medicine not found")
            
            explanation = await ai_service.generate_medicine_explanation(medicine)
            
            # Store the generated explanation
            treatment_info_data = {
                'item_type': item_type,
                'item_id': item_id,
                'item_name': medicine['name'],
                'explanation': explanation
            }
            
            result = await supabase_service.create_treatment_info(treatment_info_data)
            return result
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating treatment info: {str(e)}")

@app.post("/api/treatment-info/generate")
async def generate_treatment_info(request: TreatmentInfoRequest):
    """Generate educational content for a treatment or medicine."""
    try:
        # Validate item_type
        if request.item_type not in ['treatment', 'medicine']:
            raise HTTPException(status_code=400, detail="Invalid item_type. Must be 'treatment' or 'medicine'")
        
        if request.item_type == 'treatment':
            treatment = await supabase_service.get_treatment(request.item_id)
            if not treatment:
                raise HTTPException(status_code=404, detail="Treatment not found")
            
            explanation = await ai_service.generate_treatment_explanation(treatment)
            
            # Check if info already exists
            existing_info = await supabase_service.get_treatment_info(request.item_type, request.item_id)
            
            if existing_info:
                # Update existing info
                result = await supabase_service.update_treatment_info(request.item_type, request.item_id, explanation)
            else:
                # Create new info
                treatment_info_data = {
                    'item_type': request.item_type,
                    'item_id': request.item_id,
                    'item_name': treatment['name'],
                    'explanation': explanation
                }
                result = await supabase_service.create_treatment_info(treatment_info_data)
            
            return result
            
        elif request.item_type == 'medicine':
            medicine = await supabase_service.get_medicine(request.item_id)
            if not medicine:
                raise HTTPException(status_code=404, detail="Medicine not found")
            
            explanation = await ai_service.generate_medicine_explanation(medicine)
            
            # Check if info already exists
            existing_info = await supabase_service.get_treatment_info(request.item_type, request.item_id)
            
            if existing_info:
                # Update existing info
                result = await supabase_service.update_treatment_info(request.item_type, request.item_id, explanation)
            else:
                # Create new info
                treatment_info_data = {
                    'item_type': request.item_type,
                    'item_id': request.item_id,
                    'item_name': medicine['name'],
                    'explanation': explanation
                }
                result = await supabase_service.create_treatment_info(treatment_info_data)
            
            return result
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating treatment info: {str(e)}")

# Medical Document Endpoints
@app.post("/api/documents")
async def add_medical_document(request: MedicalDocumentRequest):
    """Add a medical document to the vector database."""
    try:
        # Prepare metadata
        metadata = request.metadata or {}
        if request.patient_id:
            metadata['patient_id'] = request.patient_id
        if request.doctor_id:
            metadata['doctor_id'] = request.doctor_id
        
        # Add document to vector database
        doc_id = await ai_service.add_medical_document(
            content=request.content,
            metadata=metadata
        )
        
        return {
            "document_id": doc_id,
            "status": "success",
            "message": "Document added successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding document: {str(e)}")

@app.get("/api/documents/search")
async def search_medical_documents(query: str, n_results: int = 5):
    """Search for medical documents based on query."""
    try:
        results = await ai_service.vector_db.search_documents(
            query=query,
            n_results=n_results
        )
        
        return {
            "query": query,
            "results": results,
            "total_found": len(results)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching documents: {str(e)}")

@app.post("/api/documents/analyze")
async def analyze_medical_document(request: DocumentAnalysisRequest):
    """Analyze a medical document and extract key information."""
    try:
        analysis = await ai_service.analyze_medical_document(
            document_content=request.content,
            document_type=request.document_type
        )
        
        return {
            "analysis": analysis,
            "document_type": request.document_type,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing document: {str(e)}")

@app.delete("/api/documents/{document_id}")
async def delete_medical_document(document_id: str):
    """Delete a medical document from the vector database."""
    try:
        success = await ai_service.vector_db.delete_document(document_id)
        
        if success:
            return {"status": "success", "message": "Document deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Document not found")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")

# Chatbot Endpoints
@app.post("/api/chat")
async def chat_with_medical_assistant(request: ChatRequest):
    """Chat with the medical assistant using context from vector database."""
    try:
        # Get patient context if patient_id is provided
        patient_context = None
        if request.patient_id:
            patient = await supabase_service.get_patient(request.patient_id)
            if patient:
                patient_context = {
                    "name": patient.get("name"),
                    "condition": patient.get("condition"),
                    "medications": []  # Could be populated from patient's current medications
                }
        
        # Get chat response with medical context
        response = await ai_service.chat_with_medical_context(
            user_message=request.message,
            user_id=request.user_id,
            session_id=request.session_id,
            patient_context=patient_context
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in chat: {str(e)}")

@app.get("/api/chat/history/{user_id}")
async def get_chat_history(user_id: str, session_id: Optional[str] = None, limit: int = 10):
    """Get chat history for a user."""
    try:
        history = await ai_service.get_chat_history(
            user_id=user_id,
            session_id=session_id,
            limit=limit
        )
        
        return {
            "user_id": user_id,
            "session_id": session_id,
            "history": history,
            "total_messages": len(history)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting chat history: {str(e)}")

@app.get("/api/vector-db/stats")
async def get_vector_database_stats():
    """Get statistics about the vector database."""
    try:
        stats = await ai_service.get_vector_db_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting vector DB stats: {str(e)}")

# File Upload Endpoint for Medical Documents
@app.post("/api/documents/upload")
async def upload_medical_document(
    file: UploadFile = File(...),
    patient_id: Optional[str] = None,
    doctor_id: Optional[str] = None,
    document_type: str = "medical_document"
):
    """Upload a medical document file and add it to the vector database."""
    try:
        # Validate file type
        allowed_extensions = ['.txt', '.pdf', '.doc', '.docx', '.rtf']
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Read file content
        content = await file.read()
        
        # For now, handle text files only (PDF processing would require additional libraries)
        if file_extension == '.txt':
            document_content = content.decode('utf-8')
        else:
            # For other file types, return a placeholder message
            document_content = f"Document content from {file.filename} - processing not yet implemented for {file_extension} files."
        
        # Prepare metadata
        metadata = {
            "filename": file.filename,
            "file_size": len(content),
            "file_type": file_extension,
            "uploaded_at": datetime.now().isoformat()
        }
        
        if patient_id:
            metadata['patient_id'] = patient_id
        if doctor_id:
            metadata['doctor_id'] = doctor_id
        
        # Add to vector database
        doc_id = await ai_service.add_medical_document(
            content=document_content,
            metadata=metadata
        )
        
        return {
            "document_id": doc_id,
            "filename": file.filename,
            "status": "success",
            "message": "Document uploaded and processed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading document: {str(e)}")

@app.post("/api/reminders/start")
async def start_reminder_conversation(data: Dict[str, Any] = Body(...)):
    """Start a new reminder/agent conversation."""
    user_id = data.get("user_id")
    message = data.get("message")
    session_id = data.get("session_id")
    # Optionally: store reminder in Supabase
    # For now, just start chat
    result = await ai_service.chat_with_medical_context(message, user_id, session_id)
    return result

@app.post("/api/reminders/message")
async def send_reminder_message(data: Dict[str, Any] = Body(...)):
    """Send a message in a reminder/agent conversation."""
    user_id = data.get("user_id")
    message = data.get("message")
    session_id = data.get("session_id")
    result = await ai_service.chat_with_medical_context(message, user_id, session_id)
    return result

@app.post("/api/reminders/schedule")
async def schedule_reminder(data: Dict[str, Any] = Body(...)):
    """Schedule a reminder for a patient (store in Supabase)."""
    # Example: {patient_id, reminder_time, message}
    try:
        reminder = {
            **data,
            "created_at": datetime.now().isoformat()
        }
        # Store in Supabase (assume a 'reminders' table exists)
        result = supabase_service.supabase.table('reminders').insert(reminder).execute()
        return {"success": True, "reminder_id": result.data[0]["id"]}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/reminders/history")
async def get_reminder_history(user_id: str, session_id: Optional[str] = None, limit: int = 10):
    """Get chat/reminder history for a user/session."""
    history = await vector_db_service.get_chat_history(user_id, session_id, limit)
    return {"history": history}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
