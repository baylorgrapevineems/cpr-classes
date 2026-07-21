"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface FormData {
  title: string;
  course_type: string;
  class_date: string;
  start_time: string;
  end_time: string;
  location: string;
  address: string;
  instructor_name: string;
  max_seats: number;
  description: string;
  is_public: boolean;
}

export default function EditClassPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormData>({
    title: "",
    course_type: "BLS",
    class_date: "",
    start_time: "",
    end_time: "",
    location: "",
    address: "",
    instructor_name: "",
    max_seats: 12,
    description: "",
    is_public: true,
  });

  useEffect(() => {
    fetch(`/api/admin/classes/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setForm({
          title: d.title ?? "",
          course_type: d.course_type ?? "BLS",
          class_date: d.class_date ?? "",
          start_time: d.start_time?.slice(0, 5) ?? "",
          end_time: d.end_time?.slice(0, 5) ?? "",
          location: d.location ?? "",
          address: d.address ?? "",
          instructor_name: d.instructor_name ?? "",
          max_seats: d.max_seats ?? 12,
          description: d.description ?? "",
          is_public: d.is_public ?? true,
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const set = (field: keyof FormData, value: string | number | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/classes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Failed to save."); return; }
      router.push(`/admin/classes/${id}`);
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-gray-400 text-sm gap-2">
      <div className="w-4 h-4 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin" /> Loading…
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href={`/admin/classes/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ChevronLeft className="w-4 h-4" /> Back to class
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Class</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <Field label="Class Title *">
          <input
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputCls}
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
          />
        </Field>

        <Field label="Address">
          <input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Instructor Name">
            <input
              value={form.instructor_name}
              onChange={(e) => set("instructor_name", e.target.value)}
              className={inputCls}
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
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <Link href={`/admin/classes/${id}`} className="text-sm text-gray-500 hover:text-gray-700">
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
