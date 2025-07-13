# Vector Database Integration Setup Guide

This guide explains how to set up and use the new AI-powered medical document understanding and chatbot features with ChromaDB vector database integration.

## Overview

The system now includes:
- **ChromaDB Vector Database**: For storing and searching medical documents
- **Medical Document Understanding**: AI-powered analysis of medical reports
- **Intelligent Chatbot**: Context-aware medical assistant
- **Semantic Search**: Find relevant medical information across documents

## Prerequisites

### Required Dependencies
- Python 3.8+
- ChromaDB
- Sentence Transformers
- Anthropic API key
- Supabase account

### New Dependencies Added
```bash
chromadb
sentence-transformers
langchain
langchain-community
langchain-chroma
aiofiles
```

## Installation

### 1. Install New Dependencies

Navigate to the backend directory and install the new requirements:

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Variables

Ensure your `.env` file includes all required variables:

```env
# Existing variables
SUPABASE_URL=your_supabase_url_here
SUPABASE_SECRET_KEY=your_supabase_secret_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ALLOW_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# New variables (optional, will use defaults if not set)
CHROMA_DB_PATH=./chroma_db
EMBEDDING_MODEL=all-MiniLM-L6-v2
```

### 3. Vector Database Initialization

The vector database will be automatically initialized when you first start the application. ChromaDB will create a local database in the `./chroma_db` directory.

## New API Endpoints

### Medical Document Management

#### Add Medical Document
```http
POST /api/documents
Content-Type: application/json

{
  "content": "Medical document content...",
  "document_type": "medical_document",
  "patient_id": "optional_patient_id",
  "doctor_id": "optional_doctor_id",
  "metadata": {
    "filename": "report.pdf",
    "date": "2024-01-15"
  }
}
```

#### Search Medical Documents
```http
GET /api/documents/search?query=eczema treatment&n_results=5
```

#### Analyze Medical Document
```http
POST /api/documents/analyze
Content-Type: application/json

{
  "content": "Medical document content to analyze...",
  "document_type": "report"
}
```

#### Upload Medical Document File
```http
POST /api/documents/upload
Content-Type: multipart/form-data

file: [binary file data]
patient_id: optional_patient_id
doctor_id: optional_doctor_id
document_type: medical_document
```

### Medical Chatbot

#### Chat with Medical Assistant
```http
POST /api/chat
Content-Type: application/json

{
  "message": "What is the treatment for eczema?",
  "user_id": "user123",
  "session_id": "session456",
  "patient_id": "patient789"
}
```

#### Get Chat History
```http
GET /api/chat/history/user123?session_id=session456&limit=10
```

### System Information

#### Health Check with Vector DB Status
```http
GET /api/health
```

#### Vector Database Statistics
```http
GET /api/vector-db/stats
```

## Frontend Integration

### New Components

#### MedicalChatbot Component
```tsx
import MedicalChatbot from '../components/ai/MedicalChatbot';

<MedicalChatbot
  userId="user123"
  patientId="patient456"
  sessionId="session789"
  className="h-full"
/>
```

#### MedicalDocumentManager Component
```tsx
import MedicalDocumentManager from '../components/ai/MedicalDocumentManager';

<MedicalDocumentManager
  patientId="patient456"
  doctorId="doctor789"
  className="space-y-6"
/>
```

### New Service

#### MedicalDocumentService
```typescript
import MedicalDocumentService from '../services/MedicalDocumentService';

// Add document
const result = await MedicalDocumentService.addDocument(content, metadata);

// Search documents
const searchResults = await MedicalDocumentService.searchDocuments(query);

// Chat with assistant
const response = await MedicalDocumentService.chat({
  message: "Health question",
  user_id: "user123"
});

// Analyze document
const analysis = await MedicalDocumentService.analyzeDocument(content);
```

## Usage Examples

### 1. Adding Medical Documents

#### Via API
```bash
curl -X POST http://localhost:8000/api/documents \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Patient: John Doe\nDiagnosis: Eczema\nTreatment: Topical corticosteroids",
    "document_type": "medical_report",
    "patient_id": "patient123",
    "metadata": {
      "date": "2024-01-15",
      "doctor": "Dr. Smith"
    }
  }'
```

#### Via Frontend
```typescript
const documentContent = `
Patient: John Doe
Diagnosis: Eczema
Symptoms: Dry, itchy skin on arms and legs
Treatment: Topical corticosteroids
Duration: 2 weeks
`;

const result = await MedicalDocumentService.addDocument(documentContent, {
  patient_name: "John Doe",
  diagnosis: "Eczema",
  date: "2024-01-15"
});
```

### 2. Searching Medical Documents

#### Via API
```bash
curl "http://localhost:8000/api/documents/search?query=eczema%20treatment&n_results=5"
```

#### Via Frontend
```typescript
const searchResults = await MedicalDocumentService.searchDocuments("eczema treatment", 5);
console.log(`Found ${searchResults.total_found} relevant documents`);
```

### 3. Using the Medical Chatbot

#### Via API
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the treatment for eczema?",
    "user_id": "user123",
    "patient_id": "patient456"
  }'
```

#### Via Frontend
```typescript
const response = await MedicalDocumentService.chat({
  message: "What is the treatment for eczema?",
  user_id: "user123",
  patient_id: "patient456"
});

console.log(response.response);
```

### 4. Analyzing Medical Documents

#### Via API
```bash
curl -X POST http://localhost:8000/api/documents/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Dermatology Consultation Report\nPatient: Mike Johnson\nDiagnosis: Contact dermatitis",
    "document_type": "consultation_report"
  }'
```

#### Via Frontend
```typescript
const analysis = await MedicalDocumentService.analyzeDocument(
  "Dermatology Consultation Report\nPatient: Mike Johnson\nDiagnosis: Contact dermatitis",
  "consultation_report"
);

console.log("Key findings:", analysis.analysis.key_findings);
console.log("Recommendations:", analysis.analysis.recommendations);
```

## Testing

### Run the Test Suite

```bash
cd backend
python test_vector_db.py
```

This will test:
- Vector database initialization
- Document addition and search
- Chat functionality
- Document analysis
- Health check endpoint

### Manual Testing

1. **Start the backend server**:
   ```bash
   cd backend
   python app/main.py
   ```

2. **Test health endpoint**:
   ```bash
   curl http://localhost:8000/api/health
   ```

3. **Test document upload**:
   ```bash
   curl -X POST http://localhost:8000/api/documents \
     -H "Content-Type: application/json" \
     -d '{"content": "Test medical document", "document_type": "test"}'
   ```

4. **Test chatbot**:
   ```bash
   curl -X POST http://localhost:8000/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello", "user_id": "test_user"}'
   ```

## Configuration

### ChromaDB Settings

The vector database is configured with these default settings:

```python
# In vector_db_service.py
self.client = chromadb.PersistentClient(
    path="./chroma_db",
    settings=Settings(
        anonymized_telemetry=False,
        allow_reset=True
    )
)
```

### Embedding Model

The system uses the `all-MiniLM-L6-v2` model for generating embeddings:

```python
self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
```

This model provides a good balance between performance and accuracy for medical text.

## Troubleshooting

### Common Issues

1. **ChromaDB initialization fails**:
   - Ensure you have write permissions in the backend directory
   - Check that ChromaDB is properly installed: `pip install chromadb`

2. **Embedding model download fails**:
   - Check your internet connection
   - Try downloading manually: `python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"`

3. **Memory issues with large documents**:
   - Consider chunking large documents before adding to the vector database
   - Monitor system memory usage

4. **API key issues**:
   - Verify your Anthropic API key is valid and has sufficient credits
   - Check the API key is properly set in your `.env` file

### Performance Optimization

1. **Batch document processing**:
   - Add multiple documents in batches rather than one at a time
   - Use the bulk upload endpoint for large datasets

2. **Search optimization**:
   - Use specific search queries for better results
   - Limit the number of results returned

3. **Memory management**:
   - Monitor ChromaDB memory usage
   - Consider using a smaller embedding model for large datasets

## Security Considerations

1. **Data Privacy**: Medical documents contain sensitive information
   - Ensure proper access controls
   - Implement data encryption at rest
   - Regular security audits

2. **API Security**: Protect your API endpoints
   - Use authentication for all endpoints
   - Implement rate limiting
   - Validate all input data

3. **Vector Database Security**: Secure ChromaDB access
   - Restrict file system access to the chroma_db directory
   - Regular backups of the vector database
   - Monitor for unauthorized access

## Monitoring

### Health Checks

Monitor the health endpoint for system status:

```bash
curl http://localhost:8000/api/health
```

### Vector Database Stats

Check vector database statistics:

```bash
curl http://localhost:8000/api/vector-db/stats
```

### Logs

Monitor application logs for:
- Vector database operations
- AI service calls
- Error messages
- Performance metrics

## Future Enhancements

1. **Advanced Document Processing**:
   - PDF text extraction
   - Image analysis for medical images
   - OCR for handwritten documents

2. **Enhanced Search**:
   - Multi-modal search (text + images)
   - Advanced filtering options
   - Search result ranking improvements

3. **Chatbot Enhancements**:
   - Multi-language support
   - Voice input/output
   - Integration with external medical databases

4. **Analytics**:
   - Usage analytics
   - Performance metrics
   - User behavior insights

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the test suite output
3. Check application logs for error messages
4. Verify all dependencies are properly installed
5. Ensure environment variables are correctly set 