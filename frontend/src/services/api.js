const API_BASE_URL = "http://127.0.0.1:8000";


export async function uploadResume(file) {
  // FormData is used when sending files to a backend API.
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/resume/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    // FastAPI sends validation messages in the "detail" field.
    throw new Error(data.detail || "Resume upload failed.");
  }

  return data;
}


export async function generateQuestions(resumeText, role) {
  // Send the extracted resume text and selected role to the interview API.
  const response = await fetch(`${API_BASE_URL}/interview/generate-questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      resume_text: resumeText,
      role,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Question generation failed.");
  }

  return data;
}


export async function evaluateInterview(role, responses) {
  // Send the completed interview answers to the backend for AI evaluation.
  const response = await fetch(`${API_BASE_URL}/feedback/evaluate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      role,
      responses,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Interview evaluation failed.");
  }

  return data;
}
