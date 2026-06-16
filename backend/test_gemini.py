from app.services.question_generator import generate_interview_questions

resume = """
Aman Hegde
Python Developer
Skills: Python, FastAPI, React, Machine Learning, SQL
Projects: Credit Card Fraud Detection, NeuroSphere AI
"""

questions = generate_interview_questions(
    resume_text=resume,
    role="Python Developer"
)

for i, q in enumerate(questions, start=1):
    print(f"{i}. {q}")