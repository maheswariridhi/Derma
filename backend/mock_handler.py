class MockHandler:
    @staticmethod
    def get_mock_validation():
        return {
            "is_valid": True,
            "confidence": 0.9,
            "warnings": ["Consider patient-specific factors"],
            "suggestions": ["Alternative treatment option: topical medication"]
        }

    @staticmethod
    def get_mock_specialty_results():
        return {
            "recommendation_id": "mock-id",
            "specialty_analysis": {
                "severity_level": "moderate",
                "affected_areas": ["face", "neck"],
                "environmental_factors": ["sun exposure", "dry climate"]
            },
            "validation_results": {
                "is_valid": True,
                "warnings": ["Consider patient age in treatment dosage"],
                "suggestions": []
            },
            "enhanced_results": {
                "specialty_specific": "Common dermatological presentation",
                "risk_factors": ["Age-related factors", "Environmental exposure"]
            }
        }

    @staticmethod
    def get_mock_response():
        return """Mock Medical Knowledge:
        - Common dermatological condition
        - Typical treatment approaches include topical medications
        - Regular monitoring recommended
        - Lifestyle modifications may help
        """
    @staticmethod
    def get_generic_mock_response():
        return {
        "status": "mock",
        "message": "This is a generic mock response for unhandled scenarios."
    }
