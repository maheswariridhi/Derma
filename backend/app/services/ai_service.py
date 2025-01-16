from langchain_community.chat_models import ChatOpenAI
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from app.models.ai_models import PatientHistory, Recommendation, AIRecommendationResponse

class DermatologyAIService:
    def __init__(self):
        self.llm = ChatOpenAI(temperature=0)
        self.embeddings = OpenAIEmbeddings()
        
        # Setup RAG
        self.medical_knowledge = Chroma(
            collection_name="medical_knowledge",
            embedding_function=self.embeddings
        )
        self.clinic_services = Chroma(
            collection_name="clinic_services",
            embedding_function=self.embeddings
        )

    async def generate_recommendations(self, patient_data: PatientHistory) -> AIRecommendationResponse:
        try:
            # Format patient information
            patient_info = f"""
            Patient: {patient_data.patient_name}
            Age: {patient_data.age}
            Condition: {patient_data.condition}
            Symptoms: {', '.join(patient_data.symptoms)}
            Previous Treatments: {', '.join(patient_data.previous_treatments)}
            Last Visit: {patient_data.last_visit}
            Allergies: {', '.join(patient_data.allergies)}
            Current Medications: {', '.join(patient_data.current_medications)}
            """

            # Get relevant medical knowledge
            medical_results = self.medical_knowledge.similarity_search(
                f"treatment for {patient_data.condition} with symptoms: {', '.join(patient_data.symptoms)}",
                k=2
            )
            medical_context = "\n".join([doc.page_content for doc in medical_results])

            # Generate recommendations using LLM
            prompt = f"""
            Based on the following patient information and medical knowledge, provide treatment recommendations:

            Patient Information:
            {patient_info}

            Medical Knowledge:
            {medical_context}

            Please provide:
            1. Treatment recommendations
            2. Next appointment suggestion
            3. Any warnings or precautions
            """

            response = await self.llm.apredict(prompt)

            # Parse response into recommendations
            recommendations = [
                Recommendation(
                    type="Treatment",
                    title="Treatment Plan",
                    description=response,
                    priority="High",
                    reasoning="Based on patient symptoms and medical knowledge"
                )
            ]

            return AIRecommendationResponse(
                recommendations=recommendations,
                next_appointment="2 weeks from today",
                additional_notes="Monitor progress and adjust treatment as needed"
            )

        except Exception as e:
            raise Exception(f"Failed to generate recommendations: {str(e)}") 