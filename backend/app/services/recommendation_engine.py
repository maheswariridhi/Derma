from typing import Dict, Any
from langchain_community.chat_models import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

class RecommendationEngine:
    def __init__(self):
        self.llm = ChatOpenAI(
            model_name="gpt-4",
            temperature=0.3
        )

    async def generate_balanced_recommendation(
        self, 
        patient_data: Dict[str, Any],
        custom_knowledge_weight: float = None
    ):
        # Use provided weight or default
        weight = custom_knowledge_weight or self.custom_knowledge_weight
        
        # Get custom knowledge
        custom_results = await self.medical_knowledge.similarity_search(
            f"treatment for {patient_data['condition']} with symptoms: {', '.join(patient_data['symptoms'])}",
            k=3
        )
        
        prompt = PromptTemplate(
            template="""
            You are a dermatology specialist. Provide recommendations using:
            - {weight}% from the provided medical context
            - {remaining_weight}% from your general medical knowledge
            
            Medical Context:
            {custom_knowledge}
            
            Patient Information:
            {patient_info}
            
            Provide:
            1. Diagnosis confidence (%)
            2. Treatment plan
            3. Reasoning for recommendations
            """,
            input_variables=["weight", "remaining_weight", "custom_knowledge", "patient_info"]
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        
        response = await chain.arun(
            weight=weight * 100,
            remaining_weight=(1 - weight) * 100,
            custom_knowledge="\n".join(doc.page_content for doc in custom_results),
            patient_info=self._format_patient_info(patient_data)
        )
        
        return response

    def _format_patient_info(self, patient_data: Dict[str, Any]) -> str:
        return f"""
        Condition: {patient_data['condition']}
        Symptoms: {', '.join(patient_data['symptoms'])}
        Medical History: {patient_data.get('medical_history', 'None')}
        Current Medications: {', '.join(patient_data.get('medications', []))}
        """ 