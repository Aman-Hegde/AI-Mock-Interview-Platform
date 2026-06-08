from fastapi import APIRouter


# Router for resume upload and parsing endpoints.
router = APIRouter(prefix="/resume", tags=["Resume"])


@router.get("/test")
def test_resume_route():
    """Check that resume routes are connected."""
    return {"message": "Resume route is working"}
