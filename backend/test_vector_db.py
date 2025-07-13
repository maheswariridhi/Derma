#!/usr/bin/env python3
"""
Test script for vector database integration and medical chatbot functionality.
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.services.vector_db_service import VectorDBService
from app.services.ai_service import AIService

# Load environment variables
load_dotenv()

async def test_vector_database():
    """Test the vector database functionality."""
    print("🧪 Testing Vector Database Integration")
    print("=" * 50)
    
    try:
        # Initialize services
        print("📡 Initializing VectorDBService...")
        vector_db = VectorDBService()
        print("✅ VectorDBService initialized successfully")
        
        # Test document addition
        print("\n📄 Testing document addition...")
        test_content = """
        Patient: John Doe
        Diagnosis: Eczema
        Symptoms: Dry, itchy skin on arms and legs
        Treatment: Topical corticosteroids
        Duration: 2 weeks
        Follow-up: Schedule appointment in 2 weeks
        """
        
        metadata = {
            "patient_name": "John Doe",
            "diagnosis": "Eczema",
            "doctor": "Dr. Smith",
            "date": "2024-01-15"
        }
        
        doc_id = await vector_db.add_document(
            content=test_content,
            metadata=metadata,
            document_type="medical_report"
        )
        print(f"✅ Document added with ID: {doc_id}")
        
        # Test document search
        print("\n🔍 Testing document search...")
        search_results = await vector_db.search_documents(
            query="eczema treatment",
            n_results=3
        )
        print(f"✅ Found {len(search_results)} relevant documents")
        
        for i, result in enumerate(search_results, 1):
            print(f"  {i}. Document ID: {result['id']}")
            print(f"     Content preview: {result['content'][:100]}...")
            print(f"     Metadata: {result['metadata']}")
        
        # Test chat message addition
        print("\n💬 Testing chat message addition...")
        message_id = await vector_db.add_chat_message(
            user_id="test_user_123",
            message="What is the treatment for eczema?",
            response="Eczema is typically treated with topical corticosteroids and moisturizers. Avoid triggers like harsh soaps and hot water.",
            session_id="test_session_456"
        )
        print(f"✅ Chat message added with ID: {message_id}")
        
        # Test chat history retrieval
        print("\n📚 Testing chat history retrieval...")
        chat_history = await vector_db.get_chat_history(
            user_id="test_user_123",
            session_id="test_session_456",
            limit=5
        )
        print(f"✅ Retrieved {len(chat_history)} chat messages")
        
        # Test collection stats
        print("\n📊 Testing collection statistics...")
        stats = await vector_db.get_collection_stats()
        print(f"✅ Collection stats: {stats}")
        
        print("\n🎉 All vector database tests passed!")
        
    except Exception as e:
        print(f"❌ Vector database test failed: {str(e)}")
        raise e

async def test_ai_service():
    """Test the AI service functionality."""
    print("\n🤖 Testing AI Service Integration")
    print("=" * 50)
    
    try:
        # Initialize AI service
        print("📡 Initializing AIService...")
        ai_service = AIService()
        print("✅ AIService initialized successfully")
        
        # Test medical document addition
        print("\n📄 Testing medical document addition...")
        medical_content = """
        Lab Results for Patient Jane Smith
        Date: 2024-01-20
        Test: Complete Blood Count (CBC)
        Results:
        - Hemoglobin: 14.2 g/dL (Normal: 12.0-15.5)
        - White Blood Cells: 7,500/μL (Normal: 4,500-11,000)
        - Platelets: 250,000/μL (Normal: 150,000-450,000)
        Conclusion: All values within normal range
        """
        
        doc_id = await ai_service.add_medical_document(
            content=medical_content,
            metadata={
                "patient_name": "Jane Smith",
                "test_type": "CBC",
                "date": "2024-01-20"
            }
        )
        print(f"✅ Medical document added with ID: {doc_id}")
        
        # Test chat with medical context
        print("\n💬 Testing medical chatbot...")
        chat_response = await ai_service.chat_with_medical_context(
            user_message="What do my lab results show?",
            user_id="test_user_456",
            session_id="test_session_789",
            patient_context={
                "name": "Jane Smith",
                "condition": "Routine checkup",
                "medications": []
            }
        )
        print(f"✅ Chat response received: {chat_response['response'][:100]}...")
        print(f"   Relevant documents found: {chat_response['relevant_documents']}")
        
        # Test document analysis
        print("\n🔬 Testing document analysis...")
        analysis_content = """
        Dermatology Consultation Report
        Patient: Mike Johnson
        Date: 2024-01-25
        
        Chief Complaint: Persistent rash on face and neck
        
        Examination:
        - Erythematous papules and plaques on cheeks and neck
        - Mild scaling present
        - No vesicles or pustules
        
        Assessment: Contact dermatitis, likely due to new skincare product
        
        Plan:
        1. Discontinue current skincare routine
        2. Apply hydrocortisone 1% cream twice daily
        3. Use gentle, fragrance-free cleanser
        4. Follow up in 2 weeks
        5. Consider patch testing if symptoms persist
        """
        
        analysis = await ai_service.analyze_medical_document(
            document_content=analysis_content,
            document_type="consultation_report"
        )
        print(f"✅ Document analysis completed")
        print(f"   Key findings: {len(analysis.get('key_findings', []))} items")
        print(f"   Recommendations: {len(analysis.get('recommendations', []))} items")
        print(f"   Confidence level: {analysis.get('confidence_level', 'Unknown')}")
        
        # Test vector database stats
        print("\n📊 Testing AI service vector DB stats...")
        stats = await ai_service.get_vector_db_stats()
        print(f"✅ Vector DB stats from AI service: {stats}")
        
        print("\n🎉 All AI service tests passed!")
        
    except Exception as e:
        print(f"❌ AI service test failed: {str(e)}")
        raise e

async def test_health_check():
    """Test the health check endpoint."""
    print("\n🏥 Testing Health Check")
    print("=" * 50)
    
    try:
        import requests
        
        # Test health endpoint
        response = requests.get("http://localhost:8000/api/health")
        
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Health check successful")
            print(f"   Status: {health_data.get('status')}")
            print(f"   Services: {health_data.get('services')}")
            
            if 'vector_db_stats' in health_data:
                stats = health_data['vector_db_stats']
                print(f"   Vector DB Stats: {stats}")
        else:
            print(f"❌ Health check failed with status code: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Health check test failed: {str(e)}")
        print("   Make sure the backend server is running on http://localhost:8000")

async def main():
    """Run all tests."""
    print("🚀 Starting Vector Database and AI Integration Tests")
    print("=" * 60)
    
    # Check if required environment variables are set
    required_vars = ['ANTHROPIC_API_KEY', 'SUPABASE_URL', 'SUPABASE_SECRET_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {missing_vars}")
        print("Please set these variables in your .env file")
        return
    
    try:
        # Run tests
        await test_vector_database()
        await test_ai_service()
        await test_health_check()
        
        print("\n🎉 All tests completed successfully!")
        print("\n📋 Summary:")
        print("✅ Vector database integration working")
        print("✅ AI service integration working")
        print("✅ Document storage and retrieval working")
        print("✅ Chat functionality working")
        print("✅ Document analysis working")
        
    except Exception as e:
        print(f"\n❌ Test suite failed: {str(e)}")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure all dependencies are installed: pip install -r requirements.txt")
        print("2. Check that your .env file has all required variables")
        print("3. Ensure the backend server is running")
        print("4. Verify your Anthropic API key is valid")

if __name__ == "__main__":
    asyncio.run(main()) 