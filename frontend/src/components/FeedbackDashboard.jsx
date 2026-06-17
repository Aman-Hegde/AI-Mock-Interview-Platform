function ScoreCard({ label, score, highlight = false }) {
  return (
    <article className={highlight ? "score-card score-card-highlight" : "score-card"}>
      <span>{label}</span>
      <strong>{score}</strong>
      <small>/ 100</small>
      <div className="score-progress" aria-label={`${label} score ${score} out of 100`}>
        <div style={{ width: `${score}%` }} />
      </div>
    </article>
  );
}


function FeedbackList({ title, items }) {
  return (
    <section className="feedback-list-card">
      <h3>{title}</h3>
      <ul className="feedback-list">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>
            <span>{index + 1}</span>
            <p>{item}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}


function buildReportText(role, feedback) {
  // Keep the report plain text so it can be opened anywhere.
  return [
    "AI Mock Interview Report",
    "",
    `Role: ${role || "Not selected"}`,
    "",
    `Overall Score: ${feedback.overall_score}/100`,
    `Technical Score: ${feedback.technical_score}/100`,
    `Communication Score: ${feedback.communication_score}/100`,
    `Problem Solving Score: ${feedback.problem_solving_score}/100`,
    "",
    "Strengths:",
    ...feedback.strengths.map((item, index) => `${index + 1}. ${item}`),
    "",
    "Weaknesses:",
    ...feedback.weaknesses.map((item, index) => `${index + 1}. ${item}`),
    "",
    "Recommendations:",
    ...feedback.recommendations.map((item, index) => `${index + 1}. ${item}`),
    "",
    "Overall Feedback:",
    feedback.overall_feedback,
  ].join("\n");
}


function FeedbackDashboard({ feedback, role, onRestart }) {
  if (!feedback) {
    return null;
  }

  function handleDownloadReport() {
    const reportText = buildReportText(role, feedback);
    const reportBlob = new Blob([reportText], { type: "text/plain" });
    const reportUrl = URL.createObjectURL(reportBlob);
    const downloadLink = document.createElement("a");

    // Create a temporary link so the browser downloads the generated report.
    downloadLink.href = reportUrl;
    downloadLink.download = "ai_mock_interview_report.txt";
    downloadLink.click();

    URL.revokeObjectURL(reportUrl);
  }

  return (
    <section className="feedback-dashboard">
      <div className="feedback-header">
        <div>
          <p className="eyebrow">AI evaluation</p>
          <h2>Feedback Dashboard</h2>
        </div>

        <div className="feedback-actions">
          <button className="secondary-button" onClick={onRestart}>
            Restart Interview
          </button>
          <button className="primary-button" onClick={handleDownloadReport}>
            Download Report
          </button>
        </div>
      </div>

      <div className="score-grid">
        <ScoreCard label="Overall Score" score={feedback.overall_score} highlight />
        <ScoreCard label="Technical" score={feedback.technical_score} />
        <ScoreCard label="Communication" score={feedback.communication_score} />
        <ScoreCard label="Problem Solving" score={feedback.problem_solving_score} />
      </div>

      <div className="feedback-grid">
        <FeedbackList title="Strengths" items={feedback.strengths} />
        <FeedbackList title="Weaknesses" items={feedback.weaknesses} />
        <FeedbackList title="Recommendations" items={feedback.recommendations} />
      </div>

      <section className="overall-feedback-card">
        <h3>Overall Feedback</h3>
        <p>{feedback.overall_feedback}</p>
      </section>
    </section>
  );
}


export default FeedbackDashboard;
