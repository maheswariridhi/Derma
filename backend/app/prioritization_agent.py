from transformers import pipeline


class PrioritizationAgent:
    """
    AI Agent for prioritizing patient cases using a pre-trained NLP model.
    """
    def __init__(self):
        # Initialize a pre-trained text classification model
        self.model = pipeline("text-classification", model="distilbert-base-uncased-finetuned-sst-2-english")
        
        # Define a mapping from model labels to priority scores
        self.label_to_score = {
            "NEGATIVE": 2.0,  # Urgent
            "POSITIVE": 1.5,  # Follow-up
        }

    def calculate_priority(self, cases):
        """
        Use an NLP model to assign a priority score to each case.
        Args:
            cases (list[dict]): List of cases (each case contains a "summary").
        Returns:
            list[dict]: Cases sorted by priority score.
        """
        for case in cases:
            # Ensure "summary" field exists
            if "summary" not in case:
                case["priority_score"] = 1.0  # Default priority for invalid cases
                continue

            try:
                # Predict the priority using the NLP model
                prediction = self.model(case["summary"])[0]  # Get the first prediction
                
                # Map the model's label to a priority score
                case["priority_score"] = self.label_to_score.get(prediction["label"], 1.0)
            except Exception as e:
                case["priority_score"] = 1.0  # Fallback for model errors
                case["error"] = str(e)

        # Sort cases by priority score in descending order
        return sorted(cases, key=lambda x: x["priority_score"], reverse=True)

