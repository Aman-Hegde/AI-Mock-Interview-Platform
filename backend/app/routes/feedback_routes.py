from fastapi import APIRouter


# Router for interview feedback endpoints.
router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.get("/test")
def test_feedback_route():
    """Check that feedback routes are connected."""
    return {"message": "Feedback route is working"}
