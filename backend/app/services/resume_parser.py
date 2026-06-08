from pypdf import PdfReader


def extract_resume_text(file):
    """Extract text and page count from an uploaded PDF resume."""
    try:
        # Make sure reading starts from the beginning of the uploaded file.
        file.file.seek(0)

        # PdfReader reads the PDF directly from the uploaded file object.
        reader = PdfReader(file.file)
        pages = len(reader.pages)

        if pages == 0:
            raise ValueError("The uploaded PDF has no pages.")

        extracted_text = ""

        # Read text from every page and join it into one string.
        for page in reader.pages:
            page_text = page.extract_text() or ""
            extracted_text += page_text + "\n"

        extracted_text = extracted_text.strip()

        if not extracted_text:
            raise ValueError("No text could be extracted from the uploaded PDF.")

        return {
            "pages": pages,
            "text": extracted_text,
        }
    except ValueError:
        # Keep beginner-friendly validation messages unchanged.
        raise
    except Exception as error:
        # Convert PDF parsing errors into a clear message for the route.
        raise ValueError("Could not read the uploaded PDF file.") from error
