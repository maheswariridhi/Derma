from typing import Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime
from langchain_openai import ChatOpenAI
import os
import re
from mock_handler import MockHandler

class ValidationResult(BaseModel):
    is_valid: bool
    confidence: float
    warnings: List[str]
    suggestions: List[str]
    validation_timestamp: datetime = datetime.now()

class RecommendationValidator:
    def __init__(self, medical_knowledge):
        try:
            self.llm = ChatOpenAI(
                model_name="gpt-4",
                temperature=0,
                openai_api_key=os.getenv("OPENAI_API_KEY")
            )
        except Exception as e:
            print(f"Warning: LLM initialization failed - {str(e)}")
            self.llm = None
            
        self.medical_knowledge = medical_knowledge
        self.confidence_threshold = 0.85
        self.warning_patterns = [
            r"(?i)contraindicated",
            r"(?i)severe side effects",
            r"(?i)high risk",
            r"(?i)caution",
            r"(?i)adverse reaction"
        ]

    async def validate_recommendation(self, recommendation: Dict) -> ValidationResult:
        try:
            if not self.llm:
                return MockHandler.get_mock_validation()  # Use MockHandler directly

            # Check against medical knowledge base
            validation_results = await self.medical_knowledge.query(
                symptoms=[recommendation.get('condition', '')],
                medical_history=f"Treatment: {recommendation.get('recommendations', '')}"
            )
            
            # Calculate confidence score
            confidence = self._calculate_confidence(validation_results, recommendation)
            
            # Check for warning patterns
            warnings = self._check_warning_patterns(recommendation)
            
            # Get suggestions if needed
            suggestions = await self._get_suggestions(recommendation) if confidence < self.confidence_threshold else []
            
            return ValidationResult(
                is_valid=confidence >= self.confidence_threshold,
                confidence=confidence,
                warnings=warnings,
                suggestions=suggestions
            )
        except Exception as e:
            print(f"Warning: Validation error - {str(e)}")
            return MockHandler.get_mock_validation()  # Use MockHandler directly

    def _calculate_confidence(self, validation_results: str, recommendation: Dict) -> float:
        # In a real implementation, this would analyze the validation results
        return 0.9

    def _check_warning_patterns(self, recommendation: Dict) -> List[str]:
        warnings = []
        recommendation_str = str(recommendation)
        for pattern in self.warning_patterns:
            if re.search(pattern, recommendation_str):
                warnings.append(f"Found potential risk: {pattern}")
        return warnings

    async def _get_suggestions(self, recommendation: Dict) -> List[str]:
        try:
            similar_cases = await self.medical_knowledge.query(
                symptoms=[recommendation.get('condition', '')],
                medical_history="alternative treatments"
            )
            return [similar_cases] if similar_cases else []
        except Exception:
            return []
