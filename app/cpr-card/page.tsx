"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";

export default function CprCardPage() {
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "", notes: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrMsg("");
    const res = await fetch("/api/card-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setStatus("done");
    } else {
      const d = await res.json().catch(() => null);
      setErrMsg(d?.error ?? "Submission failed. Please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">✓</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">We got your info!</h1>
          <p className="text-gray-500 text-sm">
            Thanks for your interest. We'll reach out when a class is available for you.
          </p>
          <Link href="/" className="inline-block mt-2 text-sm text-red-600 hover:underline">
            ← Back to classes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Baylor Grapevine EMS</p>
            <p className="text-xs text-gray-500 leading-tight">AHA BLS CPR Classes</p>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to classes
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">I need a CPR card</h1>
            <p className="text-sm text-gray-500 mt-2">
              Don't see an open class? Submit your info and we'll contact you when a class is available.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">First name *</label>
                <input
                  required
                  value={form.first_name}
                  onChange={e => set("first_name", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Last name *</label>
                <input
                  required
                  value={form.last_name}
                  onChange={e => set("last_name", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => set("email", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => set("phone", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Anything else we should know? <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={e => set("notes", e.target.value)}
                placeholder="Preferred days/times, certification deadline, etc."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            {errMsg && <p className="text-sm text-red-600">{errMsg}</p>}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {status === "submitting" ? "Submitting…" : "Submit"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
