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
