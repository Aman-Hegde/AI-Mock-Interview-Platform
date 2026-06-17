from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.question_generator import generate_interview_questions


# Router for interview question and answer endpoints.
router = APIRouter(prefix="/interview", tags=["Interview"])


class GenerateQuestionsRequest(BaseModel):
    """Request body for generating role-specific interview questions."""

    resume_text: str
    role: str


@router.get("/test")
def test_interview_route():
    """Check that interview routes are connected."""
    return {"message": "Interview route is working"}


@router.post("/generate-questions")
def generate_questions(request: GenerateQuestionsRequest):
    """Generate five interview questions from resume text and selected role."""
    try:
        # The service handles Gemini calls and returns a clean list of questions.
        questions = generate_interview_questions(
            request.resume_text,
            request.role,
        )
    except ValueError as error:
        # Bad user input should return a 400 response.
        raise HTTPException(status_code=400, detail=str(error)) from error
    except RuntimeError as error:
        # Gemini/API failures should return a clear server-side error.
        raise HTTPException(status_code=500, detail=str(error)) from error

    return {"questions": questions}
