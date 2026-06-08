from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import feedback_routes, interview_routes, resume_routes


# Create the main FastAPI application.
app = FastAPI(title="AI Mock Interview Platform")

# Allow frontend apps to call this backend.
# During development, allow all origins. This can be tightened later.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect route files to the main application.
app.include_router(resume_routes.router)
app.include_router(interview_routes.router)
app.include_router(feedback_routes.router)


@app.get("/")
def read_root():
    """Return a simple welcome message for the project."""
    return {"message": "Welcome to the AI Mock Interview Platform backend"}


@app.get("/health")
def health_check():
    """Return backend health status."""
    return {
        "status": "ok",
        "message": "AI Mock Interview Platform backend is running",
    }
