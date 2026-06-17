import json
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types


# Load GEMINI_API_KEY from backend/.env during local development.
load_dotenv()


GEMINI_EVALUATION_MODEL = "gemini-2.5-flash"
REQUIRED_SCORE_FIELDS = [
    "technical_score",
    "communication_score",
    "problem_solving_score",
    "overall_score",
]
REQUIRED_LIST_FIELDS = ["strengths", "weaknesses", "recommendations"]


def _build_evaluation_prompt(role: str, responses: list) -> str:
    """Create the strict JSON-only prompt sent to Gemini."""
    formatted_responses = json.dumps(responses, indent=2)

    return f"""You are a senior technical interviewer.

Evaluate the candidate's interview answers.

Role:
{role}

Interview responses:
{formatted_responses}

Analyze:

* Technical knowledge
* Communication skills
* Problem-solving ability

Provide:

* Technical Score (0-100)
* Communication Score (0-100)
* Problem Solving Score (0-100)
* Overall Score (0-100)

Also provide:

* Strengths (exactly 3 items)
* Weaknesses (exactly 3 items)
* Recommendations (exactly 3 items)
* Overall Feedback

IMPORTANT:

Return ONLY valid JSON.

Do NOT return markdown.
Do NOT return code blocks.
Do NOT return explanations outside JSON.

Expected JSON format:

{{
  "technical_score": 85,
  "communication_score": 80,
  "problem_solving_score": 78,
  "overall_score": 81,
  "strengths": [
    "Strength 1",
    "Strength 2",
    "Strength 3"
  ],
  "weaknesses": [
    "Weakness 1",
    "Weakness 2",
    "Weakness 3"
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2",
    "Recommendation 3"
  ],
  "overall_feedback": "Overall interview assessment."
}}"""


def _parse_json_response(response_text: str) -> dict:
    """Parse Gemini text into JSON and reject invalid JSON responses."""
    if not response_text or not response_text.strip():
        raise RuntimeError("Gemini returned an empty evaluation response.")

    try:
        return json.loads(response_text.strip())
    except json.JSONDecodeError as exc:
        raise RuntimeError("Gemini returned invalid JSON for evaluation.") from exc


def _validate_evaluation(evaluation: dict) -> dict:
    """Validate that Gemini returned the exact structured fields the app needs."""
    if not isinstance(evaluation, dict):
        raise RuntimeError("Evaluation response must be a JSON object.")

    for field in REQUIRED_SCORE_FIELDS:
        score = evaluation.get(field)
        if not isinstance(score, int) or score < 0 or score > 100:
            raise RuntimeError(f"Evaluation field '{field}' must be an integer from 0 to 100.")

    for field in REQUIRED_LIST_FIELDS:
        items = evaluation.get(field)
        valid_items = isinstance(items, list) and len(items) == 3
        if not valid_items or not all(isinstance(item, str) and item.strip() for item in items):
            raise RuntimeError(f"Evaluation field '{field}' must contain exactly 3 text items.")

    overall_feedback = evaluation.get("overall_feedback")
    if not isinstance(overall_feedback, str) or not overall_feedback.strip():
        raise RuntimeError("Evaluation field 'overall_feedback' must be a non-empty string.")

    return evaluation


def evaluate_interview(role: str, responses: list) -> dict:
    """Evaluate interview answers with Gemini and return validated JSON feedback."""
    if not role or not role.strip():
        raise ValueError("role is required for interview evaluation.")

    if not responses:
        raise ValueError("responses are required for interview evaluation.")

    for response in responses:
        question = response.get("question") if isinstance(response, dict) else None
        answer = response.get("answer") if isinstance(response, dict) else None
        if not question or not answer:
            raise ValueError("Each response must include a question and an answer.")

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set in environment variables.")

    prompt = _build_evaluation_prompt(role, responses)

    try:
        # Ask Gemini for JSON-only output, then validate it before returning.
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=GEMINI_EVALUATION_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        response_text = getattr(response, "text", "")
        evaluation = _parse_json_response(response_text)
        return _validate_evaluation(evaluation)
    except ValueError:
        raise
    except RuntimeError:
        raise
    except Exception as exc:
        raise RuntimeError(f"Gemini evaluation failed: {exc}") from exc
