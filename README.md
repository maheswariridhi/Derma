# DermaAI

An AI-powered dermatology application that simplifies patient workflows for dermatologists and cosmetologists.

---

## Tech Stack

### Frontend
- Typescript
- Axios for API calls

### Backend
- Python (FastAPI/Flask/Django)
- AI/ML Models (for personalization)--add more info
- PostgreSQL
-Kubernetes

---

### Frontend Setup

1. Navigate to the frontend/ directory:
   
   cd frontend
   npm install  #install dependencies
   echo "VITE_BACKEND_URL=http://localhost:8000" > .env  # create .env file
   npm run dev  # start development server

### Backend Setup

2. Navigate to the backend/ directory:

   cd backend
   python -m venv venv  #make virtual environment
   source venv/bin/activate       # Linux/Mac  ; activate virtual environment
   venv\Scripts\activate          # Windows
   pip install -r requirements.txt  #install dependencies
   DATABASE_URL=your_database_url  #create .env files
   SECRET_KEY=your_secret_key
   python main.py  #run the backend server





