import { useState } from "react";

import FeedbackDashboard from "./components/FeedbackDashboard";
import InterviewSession from "./components/InterviewSession";
import ResumeUpload from "./components/ResumeUpload";
import RoleSelector from "./components/RoleSelector";
import { generateQuestions } from "./services/api";


function App() {
  const [resumeResult, setResumeResult] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionError, setQuestionError] = useState("");
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [feedback, setFeedback] = useState(null);

  function handleUploadSuccess(result) {
    // Reset interview state whenever a new resume is uploaded.
    setResumeResult(result);
    setSelectedRole("");
    setQuestions([]);
    setQuestionError("");
    setIsInterviewStarted(false);
    setFeedback(null);
  }

  async function handleGenerateQuestions() {
    if (!resumeResult?.text_preview || !selectedRole) {
      setQuestionError("Upload a resume and select a role first.");
      return;
    }

    setIsGenerating(true);
    setQuestionError("");
    setQuestions([]);
    setIsInterviewStarted(false);
    setFeedback(null);

    try {
      const data = await generateQuestions(resumeResult.text_preview, selectedRole);

      // Support either a direct array response or an object with a questions key.
      const returnedQuestions = Array.isArray(data) ? data : data.questions;
      setQuestions(returnedQuestions || []);
    } catch (error) {
      setQuestionError(error.message);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleRestartInterview() {
    // Clear the full interview flow so the user can begin again from upload.
    setResumeResult(null);
    setSelectedRole("");
    setQuestions([]);
    setQuestionError("");
    setIsInterviewStarted(false);
    setFeedback(null);
  }

  const featureCards = [
    {
      title: "Resume Analysis",
      text: "Extract resume content and use it as interview context.",
    },
    {
      title: "AI Interview Questions",
      text: "Generate role-specific technical questions with Gemini.",
    },
    {
      title: "Smart Feedback Dashboard",
      text: "Review scores, strengths, weaknesses, and next steps.",
    },
  ];

  return (
    <main className="app-shell">
      <section className="hero-section">
        <div className="hero-content">
          <p className="eyebrow">Final-year AI project demo</p>
          <h1>AI Mock Interview Platform</h1>
          <p className="subtitle">
            Upload your resume, generate role-specific questions, answer them
            in a guided session, and receive a structured AI feedback report.
          </p>
        </div>

        <div className="hero-panel" aria-hidden="true">
          <span>Gemini AI</span>
          <strong>Interview Engine</strong>
          <small>Resume to feedback in one workflow</small>
        </div>
      </section>

      <section className="feature-grid">
        {featureCards.map((feature, index) => (
          <article className="feature-card" key={feature.title}>
            <span>0{index + 1}</span>
            <h2>{feature.title}</h2>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>

      <section className="workspace-grid">
        <ResumeUpload onUploadSuccess={handleUploadSuccess} />

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

      {!feedback && (
        <section className="question-workspace">
          <div className="question-controls">
            <div>
              <p className="eyebrow">Role setup</p>
              <h2>Generate interview questions</h2>
            </div>

            <RoleSelector
              selectedRole={selectedRole}
              onRoleChange={setSelectedRole}
            />

            <button
              className="primary-button"
              onClick={handleGenerateQuestions}
              disabled={!resumeResult || !selectedRole || isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Questions"}
            </button>

            {isGenerating && (
              <p className="loading-message">Generating interview questions...</p>
            )}
            {questionError && <p className="error-message">{questionError}</p>}
          </div>

          {!isInterviewStarted && (
            <div className="questions-panel">
              <div className="questions-grid">
                {questions.map((question, index) => (
                  <article className="question-card" key={`${question}-${index}`}>
                    <span>Question {index + 1}</span>
                    <p>{question}</p>
                  </article>
                ))}
              </div>

              {questions.length > 0 && (
                <button
                  className="primary-button start-interview-button"
                  onClick={() => setIsInterviewStarted(true)}
                >
                  Start Interview
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {isInterviewStarted && !feedback && (
        <InterviewSession
          questions={questions}
          role={selectedRole}
          onEvaluationComplete={setFeedback}
        />
      )}

      {feedback && (
        <FeedbackDashboard
          feedback={feedback}
          role={selectedRole}
          onRestart={handleRestartInterview}
        />
      )}
    </main>
  );
}


export default App;
