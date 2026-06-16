import os
import re

from dotenv import load_dotenv
from google import genai


# Load variables from backend/.env during local development.
load_dotenv()


# Try the newest/preferred model first, then fall back to older Flash models if
# the preferred model is temporarily unavailable or returns unusable output.
GEMINI_FALLBACK_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
]


def _parse_numbered_questions(response_text: str) -> list[str]:
    """Convert Gemini's numbered-list response into a clean Python list."""
    questions = []

    # Match lines such as "1. Question", "2) Question", or "3 - Question".
    for line in response_text.splitlines():
        cleaned_line = line.strip()
        match = re.match(r"^\d+[\).\:-]\s*(.+)$", cleaned_line)
        if match:
            questions.append(match.group(1).strip())

    # If the model returned plain lines, keep a conservative fallback parser.
    if not questions:
        questions = [
            line.strip("-* ").strip()
            for line in response_text.splitlines()
            if line.strip()
        ]

    return questions


def generate_interview_questions(resume_text: str, role: str) -> list[str]:
    """Generate exactly five technical interview questions for a resume and role."""
    if not resume_text or not resume_text.strip():
        raise ValueError("resume_text is required to generate interview questions.")

    if not role or not role.strip():
        raise ValueError("role is required to generate interview questions.")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set in environment variables.")

    prompt = f"""You are an experienced technical interviewer.

Analyze the candidate's resume and the selected role.

Generate exactly 5 technical interview questions.

Resume:
{resume_text}

Role:
{role}

Return only the questions as a numbered list."""

    # Create one Google GenAI client and reuse it for each fallback attempt.
    client = genai.Client(api_key=api_key)
    model_errors = []

    for model_name in GEMINI_FALLBACK_MODELS:
        try:
            # If a model is overloaded or unavailable, this call raises and the
            # loop automatically tries the next model in GEMINI_FALLBACK_MODELS.
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )

            response_text = getattr(response, "text", "").strip()
            if not response_text:
                raise RuntimeError("Gemini returned an empty response.")

            questions = _parse_numbered_questions(response_text)
            if len(questions) != 5:
                raise RuntimeError(
                    f"Expected 5 questions, but received {len(questions)}."
                )

            return questions
        except Exception as exc:
            # Store each failure so the final error explains which models failed.
            model_errors.append(f"{model_name}: {exc}")

    error_details = "; ".join(model_errors)
    raise RuntimeError(
        "Failed to generate interview questions with all Gemini fallback models. "
        f"Errors: {error_details}"
    )
