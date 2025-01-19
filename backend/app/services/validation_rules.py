from typing import Dict, List, Optional
from pydantic import BaseModel
from datetime import datetime

class ValidationRule(BaseModel):
    name: str
    pattern: str
    severity: str  # 'warning', 'error', 'info'
    category: str  # 'medication', 'treatment', 'diagnosis'
    description: str
    created_at: datetime = datetime.now()
    last_updated: Optional[datetime] = None

class ValidationRuleManager:
    def __init__(self, medical_knowledge, mock_mode=True):
        self.medical_knowledge = medical_knowledge
        self.mock_mode = mock_mode
        self.rules: Dict[str, ValidationRule] = {}
        
    async def add_rule(self, rule: ValidationRule):
        """Add or update validation rule"""
        self.rules[rule.name] = rule
        
    async def load_specialty_rules(self, specialty: str):
        """Load specialty-specific validation rules"""
        if self.mock_mode:
            self.rules = {
                "mock_rule": ValidationRule(
                    name="mock_rule",
                    pattern=r"test",
                    severity="warning",
                    category="treatment",
                    description="Mock validation rule"
                )
            }
            return

        specialty_rules = await self.medical_knowledge.similarity_search(
            f"validation rules for {specialty} treatments",
            k=5
        )
        
        for rule_doc in specialty_rules:
            try:
                rule = ValidationRule(**rule_doc.metadata)
                await self.add_rule(rule)
            except Exception as e:
                print(f"Error loading rule: {e}")

    async def validate_recommendation(self, recommendation: Dict, specialty: str) -> List[Dict]:
        """Apply all relevant rules to a recommendation"""
        if self.mock_mode:
            return [{
                "rule": "mock_rule",
                "severity": "warning",
                "description": "This is a mock validation warning"
            }]

        violations = []
        
        # Load specialty rules if needed
        if not self.rules:
            await self.load_specialty_rules(specialty)
            
        # Apply each rule
        for rule in self.rules.values():
            if rule.category in recommendation:
                import re
                if re.search(rule.pattern, str(recommendation[rule.category])):
                    violations.append({
                        "rule": rule.name,
                        "severity": rule.severity,
                        "description": rule.description
                    })
                    
        return violations 