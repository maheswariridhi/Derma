# DermaAI

An AI-powered dermatology application that simplifies patient workflows for dermatologists and cosmetologists.

---

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Axios for API calls

### Backend
- Python (FastAPI/Flask/Django)
- AI/ML Models (for personalization)--add more info
- PostgreSQL/SQLite for database (if applicable)--i think will be firebase

---


### Prerequisites
- **Frontend**: Node.js v14+ and npm.
- **Backend**: Python 3.9+ and `pip`.

---

### Frontend Setup

1. Navigate to the frontend/ directory:
   
   cd frontend
   npm install  #install dependencies
   REACT_APP_BACKEND_URL=http://localhost:8000  # create .env file
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





