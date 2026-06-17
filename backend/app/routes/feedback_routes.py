from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.feedback_analyzer import evaluate_interview


# Router for interview feedback endpoints.
router = APIRouter(prefix="/feedback", tags=["Feedback"])


class InterviewResponse(BaseModel):
    """One answered interview question from the frontend."""

    question: str
    answer: str


class EvaluationRequest(BaseModel):
    """Request body for AI interview evaluation."""

    role: str
    responses: list[InterviewResponse]


@router.get("/test")
def test_feedback_route():
    """Check that feedback routes are connected."""
    return {"message": "Feedback route is working"}


@router.post("/evaluate")
def evaluate_feedback(request: EvaluationRequest):
    """Evaluate interview answers and return structured feedback JSON."""
    try:
        # Convert Pydantic models into plain dictionaries for the Gemini service.
        responses = [
            response.model_dump() if hasattr(response, "model_dump") else response.dict()
            for response in request.responses
        ]
        return evaluate_interview(request.role, responses)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
