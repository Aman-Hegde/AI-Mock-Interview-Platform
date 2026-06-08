from fastapi import APIRouter


# Router for interview question and answer endpoints.
router = APIRouter(prefix="/interview", tags=["Interview"])


@router.get("/test")
def test_interview_route():
    """Check that interview routes are connected."""
    return {"message": "Interview route is working"}
