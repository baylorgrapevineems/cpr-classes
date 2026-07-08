"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Info = {
  first_name: string; last_name: string; title: string;
  class_date: string; location: string; instructor_name: string | null;
  eval_id: number | null;
};

type Answers = Record<string, string>;

function Radio({ name, value, label, answers, set }: {
  name: string; value: string; label: string;
  answers: Answers; set: (k: string, v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio" name={name} value={value}
        checked={answers[name] === value}
        onChange={() => set(name, value)}
        className="accent-red-600"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

function Question({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-gray-800">{label}</p>
      <div className="pl-3 space-y-1">{children}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="font-bold text-gray-900 border-b border-gray-200 pb-1">{title}</h2>
      {children}
    </div>
  );
}

export default function EvalPage() {
  const { token } = useParams<{ token: string }>();
  const [info, setInfo]       = useState<Info | null>(null);
  const [status, setStatus]   = useState<"loading" | "ready" | "done" | "error">("loading");
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSub]  = useState(false);
  const [errMsg, setErrMsg]   = useState("");

  useEffect(() => {
    fetch(`/api/eval/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setStatus("error"); setErrMsg(d.error); return; }
        setInfo(d);
        setStatus(d.eval_id ? "done" : "ready");
      })
      .catch(() => { setStatus("error"); setErrMsg("Failed to load."); });
  }, [token]);

  const set = (k: string, v: string) => setAnswers(a => ({ ...a, [k]: v }));

  const required = [
    "inst_q1","inst_q2","inst_q3",
    "content_q1","content_q2","content_q3","content_q4","content_q5",
    "skill_q1","skill_q2","skill_q3","skill_q4",
  ];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const missing = required.filter(k => !answers[k]);
    if (missing.length) { setErrMsg("Please answer all required questions."); return; }
    setSub(true); setErrMsg("");
    const res = await fetch(`/api/eval/${token}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers),
    });
    if (res.ok) { setStatus("done"); }
    else { const d = await res.json().catch(() => null); setErrMsg(d?.error ?? "Submission failed."); setSub(false); }
  }

  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading…</div>
  );

  if (status === "error") return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-2">
        <p className="text-red-600 font-semibold">This link is invalid or expired.</p>
        <p className="text-sm text-gray-500">{errMsg}</p>
      </div>
    </div>
  );

  if (status === "done") return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow p-10 max-w-md text-center space-y-3">
        <div className="text-5xl">✓</div>
        <h1 className="text-xl font-bold text-gray-900">Thank you!</h1>
        <p className="text-gray-500 text-sm">Your evaluation has been submitted. We appreciate your feedback.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">BLS Classroom Course Evaluation</h1>
          <div className="mt-3 text-sm text-gray-600 space-y-0.5">
            <p><span className="font-medium">Student:</span> {info!.first_name} {info!.last_name}</p>
            <p><span className="font-medium">Course:</span> {info!.title}</p>
            <p><span className="font-medium">Date:</span> {new Date(info!.class_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
            <p><span className="font-medium">Location:</span> {info!.location}</p>
            {info!.instructor_name && <p><span className="font-medium">Instructor:</span> {info!.instructor_name}</p>}
          </div>
        </div>

        <form onSubmit={submit} className="space-y-8">
          {/* Instructor */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <Section title="About Your Instructor">
              <p className="text-sm text-gray-600 -mt-2">My Instructor:</p>
              <Question label="1. Provided instruction and help during my skills practice session">
                <Radio name="inst_q1" value="yes" label="a. Yes" answers={answers} set={set} />
                <Radio name="inst_q1" value="no"  label="b. No"  answers={answers} set={set} />
              </Question>
              <Question label="2. Answered all of my questions before my skills test">
                <Radio name="inst_q2" value="yes" label="a. Yes" answers={answers} set={set} />
                <Radio name="inst_q2" value="no"  label="b. No"  answers={answers} set={set} />
              </Question>
              <Question label="3. Was professional and courteous to the students">
                <Radio name="inst_q3" value="yes" label="a. Yes" answers={answers} set={set} />
                <Radio name="inst_q3" value="no"  label="b. No"  answers={answers} set={set} />
              </Question>
            </Section>
          </div>

          {/* Course Content */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <Section title="About the Course Content">
              <Question label="1. The course learning objectives were clear.">
                <Radio name="content_q1" value="yes" label="a. Yes" answers={answers} set={set} />
                <Radio name="content_q1" value="no"  label="b. No"  answers={answers} set={set} />
              </Question>
              <Question label="2. The overall level of difficulty of the course was">
                <Radio name="content_q2" value="too_hard"    label="a. Too hard"    answers={answers} set={set} />
                <Radio name="content_q2" value="too_easy"    label="b. Too easy"    answers={answers} set={set} />
                <Radio name="content_q2" value="appropriate" label="c. Appropriate" answers={answers} set={set} />
              </Question>
              <Question label="3. The content was presented clearly.">
                <Radio name="content_q3" value="yes" label="a. Yes" answers={answers} set={set} />
                <Radio name="content_q3" value="no"  label="b. No"  answers={answers} set={set} />
              </Question>
              <Question label="4. The quality of videos and written materials was">
                <Radio name="content_q4" value="excellent" label="a. Excellent" answers={answers} set={set} />
                <Radio name="content_q4" value="good"      label="b. Good"      answers={answers} set={set} />
                <Radio name="content_q4" value="fair"      label="c. Fair"      answers={answers} set={set} />
                <Radio name="content_q4" value="poor"      label="d. Poor"      answers={answers} set={set} />
              </Question>
              <Question label="5. The equipment was clean and in good working condition.">
                <Radio name="content_q5" value="yes" label="a. Yes" answers={answers} set={set} />
                <Radio name="content_q5" value="no"  label="b. No"  answers={answers} set={set} />
              </Question>
            </Section>
          </div>

          {/* Skill Mastery */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <Section title="About Your Skill Mastery">
              <Question label="1. The course prepared me to successfully pass the skills session.">
                <Radio name="skill_q1" value="yes" label="a. Yes" answers={answers} set={set} />
                <Radio name="skill_q1" value="no"  label="b. No"  answers={answers} set={set} />
              </Question>
              <Question label="2. I am confident I can use the skills the course taught me.">
                <Radio name="skill_q2" value="yes"      label="a. Yes"      answers={answers} set={set} />
                <Radio name="skill_q2" value="no"       label="b. No"       answers={answers} set={set} />
                <Radio name="skill_q2" value="not_sure" label="c. Not sure" answers={answers} set={set} />
              </Question>
              <Question label="3. I will respond in an emergency because of the skills I learned in this course.">
                <Radio name="skill_q3" value="yes"      label="a. Yes"      answers={answers} set={set} />
                <Radio name="skill_q3" value="no"       label="b. No"       answers={answers} set={set} />
                <Radio name="skill_q3" value="not_sure" label="c. Not sure" answers={answers} set={set} />
              </Question>
              <Question label="4. I took this course to obtain professional education credit or continuing education credit.">
                <Radio name="skill_q4" value="yes" label="a. Yes" answers={answers} set={set} />
                <Radio name="skill_q4" value="no"  label="b. No"  answers={answers} set={set} />
              </Question>
            </Section>
          </div>

          {/* Optional Comments */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-5">
            <h2 className="font-bold text-gray-900 border-b border-gray-200 pb-1">Optional Comments</h2>
            {[
              { name: "comment_learning",   label: "Have you previously taken this course via another method (classroom or online)? Which learning method do you prefer and why?" },
              { name: "comment_strengths",  label: "Were there any strengths or weaknesses of the course you would like to comment on?" },
              { name: "comment_future",     label: "What would you like to see in future courses developed by the AHA?" },
            ].map(({ name, label }) => (
              <div key={name} className="space-y-1.5">
                <label className="text-sm font-medium text-gray-800">{label}</label>
                <textarea
                  name={name} rows={3}
                  value={answers[name] ?? ""}
                  onChange={e => set(name, e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
            ))}
          </div>

          {errMsg && <p className="text-red-600 text-sm text-center">{errMsg}</p>}

          <button
            type="submit" disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {submitting ? "Submitting…" : "Submit Evaluation"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">© 2020 American Heart Association</p>
      </div>
    </div>
  );
}
