import { useState } from "react";

import ResumeUpload from "./components/ResumeUpload";


function App() {
  const [resumeResult, setResumeResult] = useState(null);

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div className="hero-content">
          <p className="eyebrow">Interview practice, powered by your resume</p>
          <h1>AI Mock Interview Platform</h1>
          <p className="subtitle">
            Upload your resume, preview the extracted text, and prepare for a
            smarter mock interview workflow.
          </p>
        </div>
      </section>

      <section className="workspace-grid">
        <ResumeUpload onUploadSuccess={setResumeResult} />

        <div className="preview-card">
          <div>
            <p className="eyebrow">Extracted preview</p>
            <h2>Resume text</h2>
          </div>

          {resumeResult ? (
            <div className="preview-content">
              <div className="preview-meta">
                <span>{resumeResult.filename}</span>
                <span>{resumeResult.pages} page(s)</span>
              </div>
              <pre>{resumeResult.text_preview}</pre>
            </div>
          ) : (
            <p className="empty-state">
              Your extracted resume preview will appear here after a successful
              upload.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}


export default App;
