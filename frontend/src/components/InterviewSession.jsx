import { useState } from "react";

import { evaluateInterview } from "../services/api";


function InterviewSession({ questions, role, onEvaluationComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(
    questions.map((question) => ({
      question,
      answer: "",
    }))
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState("");

  const currentAnswer = answers[currentQuestionIndex]?.answer || "";
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const answerWordCount = currentAnswer.trim()
    ? currentAnswer.trim().split(/\s+/).length
    : 0;
  const hasAnswer = currentAnswer.trim().length > 0;

  function handleAnswerChange(event) {
    const updatedAnswers = [...answers];

    // Store the answer beside the question so it is easy to submit later.
    updatedAnswers[currentQuestionIndex] = {
      ...updatedAnswers[currentQuestionIndex],
      answer: event.target.value,
    };

    setAnswers(updatedAnswers);
  }

  function handleNextQuestion() {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }

  async function handleSubmitInterview() {
    // Save a final copy of the answers before sending them to the backend.
    const allAnswers = [...answers];

    // Keep this log while developing so we can inspect the submitted payload.
    console.log(allAnswers);

    setIsEvaluating(true);
    setEvaluationError("");

    try {
      const feedback = await evaluateInterview(role, allAnswers);
      onEvaluationComplete(feedback);
    } catch (error) {
      setEvaluationError(error.message);
    } finally {
      setIsEvaluating(false);
    }
  }

  if (!questions.length) {
    return null;
  }

  return (
    <section className="interview-session">
      <div className="session-header">
        <div>
          <p className="eyebrow">Interview session</p>
          <h2>Answer one question at a time</h2>
        </div>
        <span className="progress-pill">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
      </div>

      <article className="session-question">
        <span>Question {currentQuestionIndex + 1}</span>
        <p>{questions[currentQuestionIndex]}</p>
      </article>

      <label className="answer-field">
        <span>Your answer</span>
        <textarea
          value={currentAnswer}
          onChange={handleAnswerChange}
          placeholder="Type your answer here..."
        />
      </label>

      <div className="answer-meta">
        <span>{answerWordCount} word{answerWordCount === 1 ? "" : "s"}</span>
        {!hasAnswer && <span>Answer required to continue</span>}
      </div>

      {isLastQuestion ? (
        <button
          className="primary-button"
          onClick={handleSubmitInterview}
          disabled={isEvaluating}
        >
          {isEvaluating ? "Evaluating..." : "Submit Interview"}
        </button>
      ) : (
        <button
          className="primary-button"
          onClick={handleNextQuestion}
          disabled={!hasAnswer}
        >
          Next Question
        </button>
      )}

      {isEvaluating && (
        <p className="loading-message">AI is evaluating your interview...</p>
      )}
      {evaluationError && <p className="error-message">{evaluationError}</p>}
    </section>
  );
}


export default InterviewSession;
