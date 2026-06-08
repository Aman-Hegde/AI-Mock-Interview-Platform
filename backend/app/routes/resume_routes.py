from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.resume_parser import extract_resume_text


# Router for resume upload and parsing endpoints.
router = APIRouter(prefix="/resume", tags=["Resume"])


@router.get("/test")
def test_resume_route():
    """Check that resume routes are connected."""
    return {"message": "Resume route is working"}


@router.post("/upload")
def upload_resume(file: UploadFile | None = File(default=None)):
    """Upload a PDF resume and return extracted text preview."""
    if file is None:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    filename = file.filename or ""
    is_pdf_content = file.content_type == "application/pdf"
    has_pdf_extension = filename.lower().endswith(".pdf")

    # Validate that the uploaded file looks like a PDF.
    if not is_pdf_content and not has_pdf_extension:
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    try:
        resume_data = extract_resume_text(file)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return {
        "filename": filename,
        "pages": resume_data["pages"],
        "text_preview": resume_data["text"][:1000],
    }
