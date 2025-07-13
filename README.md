# Dermatology Patient Management System

A comprehensive dermatology patient management system with AI-powered medical document understanding and chatbot functionality.

## Features

### Core Features
- **Patient Management**: Complete patient records, profiles, and history
- **Treatment Management**: Treatment plans, scheduling, and tracking
- **Medicine Management**: Inventory, prescriptions, and dosage tracking
- **Report Generation**: Comprehensive medical reports and documentation
- **Doctor Dashboard**: Professional interface for healthcare providers
- **Patient Portal**: User-friendly interface for patients

### AI-Powered Features
- **Educational Content**: AI-generated explanations for treatments and medications
- **Medical Document Understanding**: Vector database-powered document analysis
- **Intelligent Chatbot**: Context-aware medical assistant with conversation history
- **Document Search**: Semantic search across medical documents and reports
- **Document Analysis**: AI-powered extraction of key medical information

## Tech Stack

### Backend
- **Python (FastAPI)**: High-performance API framework
- **AI/ML Models**: Anthropic Claude for natural language processing
- **PostgreSQL (Supabase)**: Primary database for structured data
- **ChromaDB**: Vector database for document embeddings and semantic search
- **Sentence Transformers**: Text embedding generation

### Frontend
- **React (TypeScript)**: Modern UI framework
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: High-quality React components
- **Vite**: Fast build tool and development server

### AI Services
- **Anthropic Claude 3 Sonnet**: Advanced language model for medical content generation
- **Vector Database**: ChromaDB for semantic document storage and retrieval
- **Embedding Model**: all-MiniLM-L6-v2 for text vectorization

## Architecture

### Core Components
1. **Patient Management System**: CRUD operations for patient data
2. **Treatment & Medicine Management**: Healthcare service management
3. **Report System**: Medical documentation and record keeping
4. **AI Educational Content**: Patient-friendly explanations
5. **Vector Database Integration**: Document understanding and search
6. **Medical Chatbot**: Context-aware conversation system

### AI Agent Architecture
- **LLM Reasoner**: Claude 3 Sonnet for understanding and reasoning
- **Tool Use Layer**: API endpoints for database operations
- **Memory Layer**: ChromaDB for document and conversation storage
- **Constraints Engine**: Medical safety and validation checks
- **Learning Loop**: Conversation history and feedback integration

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- Supabase account
- Anthropic API key

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your credentials:
   ```env
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_SECRET_KEY=your_supabase_secret_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ALLOW_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   ```

5. Run database migrations:
   ```bash
   # Execute the SQL script in your Supabase dashboard
   # or use the supabase_setup.sql file
   ```

6. Start the backend server:
   ```bash
   python app/main.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Core Endpoints
- `GET /api/health` - Health check with vector database status
- `GET /api/patients` - Patient management
- `GET /api/treatments` - Treatment management
- `GET /api/medicines` - Medicine management
- `GET /api/reports` - Report management

### AI-Powered Endpoints
- `GET /api/treatment-info/{type}/{id}` - Educational content
- `POST /api/documents` - Add medical documents to vector database
- `GET /api/documents/search` - Semantic document search
- `POST /api/documents/analyze` - AI document analysis
- `POST /api/chat` - Medical chatbot conversation
- `GET /api/chat/history/{user_id}` - Chat history retrieval
- `GET /api/vector-db/stats` - Vector database statistics

## Usage

### For Doctors
1. **Patient Management**: Create and manage patient records
2. **Treatment Planning**: Design and track treatment protocols
3. **Document Analysis**: Upload and analyze medical documents
4. **AI Assistant**: Use the chatbot for medical queries and documentation
5. **Educational Content**: Generate patient-friendly explanations

### For Patients
1. **Profile Management**: View and update personal information
2. **Treatment Tracking**: Monitor treatment progress and medications
3. **Educational Content**: Access AI-generated explanations
4. **Medical Chatbot**: Ask health-related questions
5. **Report Access**: View medical reports and recommendations

### AI Features
1. **Document Upload**: Add medical documents to the knowledge base
2. **Semantic Search**: Find relevant medical information
3. **Document Analysis**: Extract key findings and recommendations
4. **Intelligent Chat**: Context-aware medical conversations
5. **Educational Content**: Patient-friendly medical explanations

## Security Considerations

- **API Key Management**: Secure storage of Anthropic API keys
- **Row-Level Security**: Supabase RLS policies for data protection
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Graceful error responses without sensitive data exposure
- **CORS Configuration**: Proper cross-origin request handling

## Cost Considerations

- **Anthropic API**: Pay-per-token for AI content generation
- **Supabase**: Database hosting and storage costs
- **Vector Database**: Local ChromaDB storage (no additional costs)
- **Caching**: Implemented to minimize repeated API calls

## Future Enhancements

- **Multi-language Support**: Internationalization for global use
- **Advanced Document Processing**: PDF and image analysis
- **Integration APIs**: Connect with external medical systems
- **Mobile Applications**: React Native or Flutter apps
- **Advanced Analytics**: Medical data insights and reporting
- **Telemedicine Features**: Video consultations and remote care
- **Blockchain Integration**: Secure medical record management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.





