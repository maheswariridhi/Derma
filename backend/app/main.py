from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prioritization_agent import PrioritizationAgent  # Import the AI logic

# Initialize the FastAPI app
app = FastAPI()

# Add CORS middleware to allow communication with React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # "*" means all origins (change in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the AI prioritization agent
agent = PrioritizationAgent()

@app.post("/ai/prioritize")
def prioritize_cases(cases: list[dict]):
    """
    API endpoint to prioritize patient cases using AI.
    Args:
        cases (list[dict]): List of cases with "summary" field.
    Returns:
        dict: Sorted cases based on priority score.
    """
    if not isinstance(cases, list):
        raise HTTPException(status_code=400, detail="Input must be a list of cases.")
    
    prioritized_cases = agent.calculate_priority(cases)
    return {"prioritized_cases": prioritized_cases}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
