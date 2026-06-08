import { useState } from "react";

import { uploadResume } from "../services/api";


function ResumeUpload({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleFileChange(event) {
    const file = event.target.files[0];
    setSelectedFile(file);
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleUpload() {
    if (!selectedFile) {
      setErrorMessage("Please choose a PDF resume first.");
      return;
    }

    const isPdfFile =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdfFile) {
      setErrorMessage("Only PDF files are supported.");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await uploadResume(selectedFile);
      setSuccessMessage(`${result.filename} uploaded successfully.`);
      onUploadSuccess(result);
    } catch (error) {
      setErrorMessage(error.message);
      onUploadSuccess(null);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="upload-card">
      <div className="upload-header">
        <p className="eyebrow">Resume analysis</p>
        <h2>Upload your PDF resume</h2>
        <p>
          Start by sending your resume to the backend. The app will extract a
          text preview that can power interview questions in the next phase.
        </p>
      </div>

      <label className="file-drop" htmlFor="resume-file">
        <span>{selectedFile ? selectedFile.name : "Choose a PDF file"}</span>
        <small>PDF only</small>
      </label>
      <input
        id="resume-file"
        className="file-input"
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
      />

      <button className="primary-button" onClick={handleUpload} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload Resume"}
      </button>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}


export default ResumeUpload;
