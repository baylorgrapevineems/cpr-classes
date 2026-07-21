"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewClassPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "AHA BLS for Healthcare Providers",
    course_type: "BLS",
    class_date: "",
    start_time: "08:00",
    end_time: "12:00",
    location: "",
    address: "",
    instructor_name: "Robert Baca",
    max_seats: 12,
    description: "",
    is_public: true,
  });

  const set = (field: string, value: string | number | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to create class."); return; }
      router.push(`/admin/classes/${json.id}`);
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/admin/classes" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ChevronLeft className="w-4 h-4" /> Back to classes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Class</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <Field label="Class Title *">
          <input
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputCls}
            placeholder="AHA BLS for Healthcare Providers"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Date *">
            <input
              required
              type="date"
              value={form.class_date}
              onChange={(e) => set("class_date", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Course Type">
            <select value={form.course_type} onChange={(e) => set("course_type", e.target.value)} className={inputCls}>
              <option value="BLS">BLS</option>
              <option value="ACLS">ACLS</option>
              <option value="PALS">PALS</option>
              <option value="Heartsaver">Heartsaver</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Time *">
            <input
              required
              type="time"
              value={form.start_time}
              onChange={(e) => set("start_time", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="End Time">
            <input
              type="time"
              value={form.end_time}
              onChange={(e) => set("end_time", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Location / Venue *">
          <input
            required
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            className={inputCls}
            placeholder="Baylor Grapevine EMS Station 1"
          />
        </Field>

        <Field label="Address">
          <input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            className={inputCls}
            placeholder="1600 W College St, Grapevine, TX 76051"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Instructor Name">
            <input
              value={form.instructor_name}
              onChange={(e) => set("instructor_name", e.target.value)}
              className={inputCls}
              placeholder="Jane Smith"
            />
          </Field>
          <Field label="Max Seats *">
            <input
              required
              type="number"
              min={1}
              value={form.max_seats}
              onChange={(e) => set("max_seats", parseInt(e.target.value) || 12)}
              className={inputCls}
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className={inputCls + " resize-none"}
            placeholder="Optional notes about this class, prerequisites, what to bring, etc."
          />
        </Field>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="is_public"
            checked={form.is_public}
            onChange={(e) => set("is_public", e.target.checked)}
            className="w-4 h-4 accent-red-600"
          />
          <label htmlFor="is_public" className="text-sm text-gray-700">
            Show on public class listing
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            {saving ? "Creating…" : "Create Class"}
          </button>
          <Link href="/admin/classes" className="text-sm text-gray-500 hover:text-gray-700">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  );
}
