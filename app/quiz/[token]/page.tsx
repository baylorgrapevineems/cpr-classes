"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Heart, CheckCircle, XCircle, AlertCircle } from "lucide-react";

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
  version: string;
  questions: Question[];
  alreadySubmitted: boolean;
  score: number | null;
  passed: boolean | null;
};

type Result = {
  score: number;
  passed: boolean;
  total: number;
};

export default function QuizPage() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    fetch(`/api/quiz/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return; }
        setData(d);
        if (d.alreadySubmitted && d.score != null) {
          setResult({ score: d.score, passed: d.passed, total: 25 });
        }
      })
      .catch(() => setError("Failed to load exam"))
      .finally(() => setLoading(false));
  }, [token]);

  const answered = Object.keys(answers).length;
  const total = data?.questions.length ?? 25;
  const allAnswered = answered === total;

  const submit = async () => {
    if (!allAnswered) {
      alert(`Please answer all ${total} questions before submitting.`);
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
      if (!res.ok) { alert(d.error ?? "Submission failed"); return; }
      setResult(d);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
        Loading exam…
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="font-semibold text-gray-800">{error}</p>
        <p className="text-sm text-gray-400 mt-1">This link may be invalid or expired.</p>
      </div>
    </div>
  );

  if (!data) return null;

  const classDt = new Date(data.classDate).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-tight truncate">AHA BLS Written Exam</p>
            <p className="text-xs text-gray-400 leading-tight truncate">{data.classTitle} · {classDt}</p>
          </div>
          {!result && (
            <span className="text-xs text-gray-500 shrink-0">
              {answered}/{total} answered
            </span>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Result banner */}
        {result ? (
          <div className={`rounded-xl border p-6 mb-8 text-center ${
            result.passed
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          }`}>
            {result.passed ? (
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            ) : (
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            )}
            <p className={`text-2xl font-bold mb-1 ${result.passed ? "text-emerald-700" : "text-red-700"}`}>
              {result.passed ? "Congratulations — You Passed!" : "Not Quite — Try Again"}
            </p>
            <p className={`text-sm ${result.passed ? "text-emerald-600" : "text-red-600"}`}>
              Score: {result.score}/{result.total} ({Math.round((result.score / result.total) * 100)}%)
              {result.passed
                ? " · Your instructor will be notified."
                : " · You need 21 out of 25 (84%) to pass. Contact your instructor."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
            <p className="font-semibold text-gray-900 text-sm mb-1">
              Hi {data.firstName} — welcome to your AHA BLS Written Exam
            </p>
            <p className="text-xs text-gray-500">
              This is an <strong>open-book exam</strong>. Use the reference documents attached to your email.
              Answer all 25 questions, then click Submit. You need <strong>21 out of 25 (84%)</strong> to pass.
            </p>
          </div>
        )}

        {/* Questions */}
        <div className="space-y-6">
          {data.questions.map((q, idx) => {
            const showScenario =
              q.scenario &&
              (idx === 0 || data.questions[idx - 1].scenario !== q.scenario);

            return (
              <div key={q.number}>
                {showScenario && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-3 text-sm text-blue-800 italic">
                    {q.scenario}
                  </div>
                )}
                <div className={`bg-white rounded-xl border border-gray-200 p-5 ${result ? "opacity-75" : ""}`}>
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    <span className="text-red-600 font-bold mr-1">{q.number}.</span>
                    {q.text}
                  </p>
                  <div className="space-y-2">
                    {(["A", "B", "C", "D"] as const).map((letter) => {
                      const selected = answers[q.number] === letter;
                      return (
                        <label
                          key={letter}
                          className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                            result
                              ? "cursor-default"
                              : selected
                              ? "border-red-400 bg-red-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          } ${selected && !result ? "border-red-400 bg-red-50" : ""}`}
                        >
                          <input
                            type="radio"
                            name={`q${q.number}`}
                            value={letter}
                            checked={selected}
                            disabled={!!result}
                            onChange={() => setAnswers((p) => ({ ...p, [q.number]: letter }))}
                            className="mt-0.5 shrink-0 accent-red-600"
                          />
                          <span className="text-gray-700">
                            <span className="font-semibold text-gray-900">{letter}.</span>{" "}
                            {q.options[letter]}
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

        {/* Submit button */}
        {!result && (
          <div className="mt-8 flex flex-col items-center gap-3">
            {!allAnswered && (
              <p className="text-xs text-amber-600">
                {total - answered} question{total - answered !== 1 ? "s" : ""} remaining
              </p>
            )}
            <button
              onClick={submit}
              disabled={submitting || !allAnswered}
              className="w-full max-w-xs bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {submitting ? "Submitting…" : "Submit Exam"}
            </button>
            <p className="text-xs text-gray-400">Your answers cannot be changed after submitting.</p>
          </div>
        )}
      </main>
    </div>
  );
}
