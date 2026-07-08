"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type QuestionOption = { A: string; B: string; C: string; D: string };

type Question = {
  number: number;
  scenario: string | null;
  text: string;
  options: QuestionOption;
};

type QuizData = {
  firstName: string;
  lastName: string;
  classTitle: string;
  classDate: string;
  questions: Question[];
  alreadySubmitted: boolean;
  score: number | null;
  passed: boolean | null;
};

type Result = { score: number; passed: boolean; total: number };

const LETTERS = ["A", "B", "C", "D"] as const;

export default function QuizPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [retaking, setRetaking] = useState(false);

  const loadQuiz = () => {
    setLoading(true);
    fetch(`/api/quiz/${token}`)
      .then((r) => r.json())
      .then((d: QuizData & { error?: string }) => {
        if (d.error) { setError(d.error); return; }
        setData(d);
        if (d.alreadySubmitted && d.score !== null && d.passed !== null) {
          setResult({ score: d.score, passed: d.passed, total: 25 });
        }
      })
      .catch(() => setError("Failed to load exam. Please refresh the page."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadQuiz(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const answered = Object.keys(answers).length;
  const total = data?.questions.length ?? 25;
  const allAnswered = answered === total;

  const submit = async () => {
    if (!allAnswered) {
      const missing = Array.from({ length: total }, (_, i) => i + 1).filter((n) => !answers[n]);
      alert(`Please answer question${missing.length > 1 ? "s" : ""} ${missing.join(", ")} before submitting.`);
      return;
    }
    if (!confirm("Submit your exam? You cannot change your answers after submitting.")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quiz/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const d = await res.json();
      if (!res.ok) { alert(d.error ?? "Submission failed. Please try again."); return; }
      setResult(d);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      alert("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const startRetake = () => {
    setResult(null);
    setAnswers({});
    setRetaking(true);
    // Reset on the data side so the form shows fresh
    if (data) setData({ ...data, alreadySubmitted: false, score: null, passed: null });
    setRetaking(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8f8f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#666", fontSize: 14 }}>Loading exam…</p>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#f8f8f8", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
      <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 32, maxWidth: 440, textAlign: "center" }}>
        <p style={{ fontWeight: 700, color: "#333", marginBottom: 8 }}>Unable to load exam</p>
        <p style={{ color: "#888", fontSize: 13 }}>{error}</p>
      </div>
    </div>
  );

  if (!data) return null;

  const classDt = (() => {
    try {
      return new Date(data.classDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    } catch { return data.classDate; }
  })();

  return (
    <div style={{ minHeight: "100vh", background: "#f0f0f0", padding: "24px 16px 48px", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* AHA-style header */}
        <div style={{ background: "#c8102e", color: "#fff", padding: "20px 28px", borderRadius: "8px 8px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", opacity: 0.85, margin: 0 }}>
                American Heart Association
              </p>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: "4px 0 2px" }}>
                Basic Life Support (BLS)
              </h1>
              <p style={{ fontSize: 14, opacity: 0.9, margin: 0 }}>Written Examination — Open Book</p>
            </div>
            {!result && (
              <div style={{ textAlign: "right", fontSize: 12, opacity: 0.9 }}>
                <p style={{ margin: 0 }}>{answered} of {total} answered</p>
              </div>
            )}
          </div>
        </div>

        {/* Student info bar */}
        <div style={{ background: "#fff", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd", padding: "14px 28px", display: "flex", flexWrap: "wrap", gap: "16px 40px", fontSize: 13, color: "#333" }}>
          <span><strong>Student:</strong> {data.firstName} {data.lastName}</span>
          <span><strong>Class:</strong> {data.classTitle}</span>
          <span><strong>Date:</strong> {classDt}</span>
        </div>

        {/* Instructions bar */}
        <div style={{ background: "#fafafa", borderLeft: "1px solid #ddd", borderRight: "1px solid #ddd", borderTop: "1px solid #eee", padding: "10px 28px", fontSize: 12, color: "#555" }}>
          This is an <strong>open-book exam</strong>. Use the reference documents attached to your email. Select the <strong>best answer</strong> for each question.
          A score of <strong>21/25 (84%) or higher</strong> is required to pass.
        </div>

        {/* Result banner */}
        {result && (
          <div style={{
            background: result.passed ? "#f0fdf4" : "#fff5f5",
            border: `1px solid ${result.passed ? "#86efac" : "#fca5a5"}`,
            borderTop: "none",
            padding: "20px 28px",
            textAlign: "center",
          }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: result.passed ? "#15803d" : "#b91c1c", margin: "0 0 6px" }}>
              {result.passed ? "Exam Passed" : "Exam Not Passed"}
            </p>
            <p style={{ fontSize: 15, color: result.passed ? "#166534" : "#991b1b", margin: "0 0 14px" }}>
              Score: {result.score} / {result.total} &nbsp;·&nbsp; {Math.round((result.score / result.total) * 100)}%
              {result.passed ? " — Congratulations!" : " — You need 21/25 to pass."}
            </p>
            {!result.passed && (
              <button
                onClick={startRetake}
                disabled={retaking}
                style={{
                  background: "#c8102e", color: "#fff", border: "none",
                  padding: "10px 28px", borderRadius: 6, fontWeight: 700,
                  fontSize: 14, cursor: "pointer",
                }}
              >
                Retake Exam
              </button>
            )}
            {result.passed && (
              <p style={{ fontSize: 12, color: "#555", marginTop: 4 }}>Your instructor has been notified. No further action needed.</p>
            )}
          </div>
        )}

        {/* Questions */}
        <div style={{ background: "#fff", border: "1px solid #ddd", borderTop: result ? "none" : "1px solid #ddd", borderRadius: result ? "0 0 8px 8px" : 0 }}>
          {data.questions.map((q, idx) => {
            const showScenario =
              q.scenario != null &&
              (idx === 0 || data.questions[idx - 1].scenario !== q.scenario);

            return (
              <div key={q.number} style={{ borderBottom: idx < total - 1 ? "1px solid #eee" : "none" }}>
                {showScenario && (
                  <div style={{
                    margin: "0",
                    padding: "14px 28px 10px",
                    background: "#f9f9f9",
                    borderBottom: "1px solid #e8e8e8",
                    borderTop: idx > 0 ? "2px solid #ddd" : "none",
                    fontSize: 13,
                    color: "#333",
                    fontStyle: "italic",
                    lineHeight: 1.6,
                  }}>
                    <strong style={{ fontStyle: "normal", color: "#555", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>Scenario</strong>
                    <br />
                    {q.scenario}
                  </div>
                )}

                <div style={{ padding: "18px 28px" }}>
                  {/* Question text */}
                  <p style={{ margin: "0 0 14px", fontSize: 14, color: "#111", lineHeight: 1.55 }}>
                    <strong style={{ color: "#c8102e" }}>{q.number}.</strong>&nbsp;{q.text}
                  </p>

                  {/* Options */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {LETTERS.map((letter) => {
                      const selected = answers[q.number] === letter;
                      const disabled = !!result && result.passed;
                      return (
                        <label
                          key={letter}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            padding: "9px 14px",
                            borderRadius: 5,
                            border: selected ? "1.5px solid #c8102e" : "1.5px solid #ddd",
                            background: selected ? "#fff5f5" : "#fafafa",
                            cursor: disabled ? "default" : "pointer",
                            fontSize: 13,
                            color: "#222",
                            lineHeight: 1.5,
                            transition: "border-color 0.15s, background 0.15s",
                          }}
                        >
                          <input
                            type="radio"
                            name={`q${q.number}`}
                            value={letter}
                            checked={selected}
                            disabled={disabled}
                            onChange={() => !result && setAnswers((p) => ({ ...p, [q.number]: letter }))}
                            style={{ marginTop: 2, accentColor: "#c8102e", cursor: disabled ? "default" : "pointer", flexShrink: 0 }}
                          />
                          <span>
                            <strong>{letter}.</strong>&nbsp;{q.options[letter]}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit footer */}
        {!result && (
          <div style={{ background: "#fff", border: "1px solid #ddd", borderTop: "2px solid #eee", borderRadius: "0 0 8px 8px", padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <p style={{ fontSize: 13, color: allAnswered ? "#15803d" : "#666", margin: 0, fontWeight: allAnswered ? 600 : 400 }}>
              {allAnswered
                ? "All questions answered — ready to submit."
                : `${total - answered} question${total - answered !== 1 ? "s" : ""} remaining`}
            </p>
            <button
              onClick={submit}
              disabled={submitting || !allAnswered}
              style={{
                background: allAnswered ? "#c8102e" : "#ccc",
                color: "#fff",
                border: "none",
                padding: "11px 32px",
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 14,
                cursor: allAnswered ? "pointer" : "not-allowed",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Submitting…" : "Submit Exam"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
