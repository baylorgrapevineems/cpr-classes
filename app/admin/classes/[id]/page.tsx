"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Pencil,
  AlertTriangle,
  Download,
  BadgeCheck,
} from "lucide-react";
import { ClassWithRegistrations, Registration } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

type AttendanceField = "attended" | "passed";

export default function AdminClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<ClassWithRegistrations | null>(null);
  const [loading, setLoading] = useState(true);

  // Add student modal state
  const [showAdd, setShowAdd] = useState(false);
  const [addFirst, setAddFirst] = useState("");
  const [addLast, setAddLast] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addOrg, setAddOrg] = useState("");
  const [adding, setAdding] = useState(false);

  // Expanded row for card info
  const [expanded, setExpanded] = useState<number | null>(null);
  const [cardEdits, setCardEdits] = useState<Record<number, Partial<Registration>>>({});
  const [savingCard, setSavingCard] = useState<number | null>(null);

  // Cancel class
  const [cancelling, setCancelling] = useState(false);

  // Complete class
  const [completing, setCompleting] = useState(false);
  const toggleComplete = async () => {
    if (!data) return;
    setCompleting(true);
    await fetch(`/api/admin/classes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_completed: !data.is_completed }),
    });
    setCompleting(false);
    load();
  };

  // Download forms
  const [downloading, setDownloading] = useState(false);
  const downloadForms = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/admin/classes/${id}/forms`);
      if (!res.ok) { alert("Failed to generate forms."); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CPR-Class-${data?.class_date ?? id}-Forms.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const load = () => {
    fetch(`/api/admin/classes/${id}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleAttendance = async (reg: Registration, field: AttendanceField) => {
    const current = reg[field];
    const next = current === true ? false : current === false ? null : true;
    await fetch(`/api/admin/registrations/${reg.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: next }),
    });
    load();
  };

  const removeStudent = async (regId: number) => {
    if (!confirm("Remove this student from the class?")) return;
    await fetch(`/api/admin/registrations/${regId}`, { method: "DELETE" });
    load();
  };

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    await fetch(`/api/classes/${id}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name: addFirst, last_name: addLast, email: addEmail, phone: addPhone, organization: addOrg }),
    });
    setAdding(false);
    setShowAdd(false);
    setAddFirst(""); setAddLast(""); setAddEmail(""); setAddPhone(""); setAddOrg("");
    load();
  };

  const saveCardInfo = async (regId: number) => {
    setSavingCard(regId);
    const edits = cardEdits[regId] ?? {};
    await fetch(`/api/admin/registrations/${regId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(edits),
    });
    setSavingCard(null);
    setExpanded(null);
    load();
  };

  const toggleCancel = async () => {
    if (!data) return;
    const msg = data.is_cancelled
      ? "Restore this class?"
      : "Cancel this class? Students will still be registered but the class will show as cancelled.";
    if (!confirm(msg)) return;
    setCancelling(true);
    await fetch(`/api/admin/classes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_cancelled: !data.is_cancelled }),
    });
    setCancelling(false);
    load();
  };

  const deleteClass = async () => {
    if (!confirm("Permanently delete this class and all registrations? This cannot be undone.")) return;
    await fetch(`/api/admin/classes/${id}`, { method: "DELETE" });
    router.push("/admin/classes");
  };

  function AttendancePill({ value, onClick }: { value: boolean | null; onClick: () => void }) {
    if (value === true) return (
      <button onClick={onClick} title="Click to cycle" className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full hover:bg-emerald-100 transition-colors">
        <CheckCircle className="w-3 h-3" /> Yes
      </button>
    );
    if (value === false) return (
      <button onClick={onClick} title="Click to cycle" className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full hover:bg-red-100 transition-colors">
        <XCircle className="w-3 h-3" /> No
      </button>
    );
    return (
      <button onClick={onClick} title="Click to set" className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full hover:bg-gray-200 transition-colors">
        — Set
      </button>
    );
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-gray-400 text-sm gap-2">
      <div className="w-4 h-4 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin" /> Loading…
    </div>
  );
  if (!data) return <div className="text-sm text-gray-400 py-10">Class not found.</div>;

  const filled = data.registrations.length;
  const seatsLeft = data.max_seats - filled;
  const passed = data.registrations.filter((r) => r.passed === true).length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb + actions */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/classes" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ChevronLeft className="w-4 h-4" /> All classes
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {data.is_completed && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                <BadgeCheck className="w-3.5 h-3.5" /> Completed
              </span>
            )}
            {data.is_cancelled && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded px-2 py-0.5">
                <AlertTriangle className="w-3 h-3" /> Cancelled
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <button
            onClick={toggleComplete}
            disabled={completing}
            className={`inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${
              data.is_completed
                ? "text-emerald-700 bg-emerald-100 hover:bg-emerald-200 font-medium"
                : "text-gray-600 bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <BadgeCheck className="w-4 h-4" />
            {completing ? "Saving…" : data.is_completed ? "Completed ✓" : "Mark Complete"}
          </button>
          <button
            onClick={downloadForms}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 px-3 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Generating…" : "Download Forms"}
          </button>
          <Link
            href={`/admin/classes/${id}/edit`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" /> Edit
          </Link>
          <button
            onClick={toggleCancel}
            disabled={cancelling}
            className="text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
          >
            {data.is_cancelled ? "Restore" : "Cancel Class"}
          </button>
          <button
            onClick={deleteClass}
            className="text-sm text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Class info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Calendar, label: "Date", value: formatDate(data.class_date).replace(/,.*$/, "").trim(), sub: data.class_date },
          { icon: Clock, label: "Time", value: formatTime(data.start_time), sub: data.end_time ? `– ${formatTime(data.end_time)}` : "" },
          { icon: MapPin, label: "Location", value: data.location, sub: data.address ?? "" },
          { icon: User, label: "Instructor", value: data.instructor_name ?? "—", sub: data.course_type },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Icon className="w-3.5 h-3.5" /> {label}
            </div>
            <p className="font-semibold text-gray-900 text-sm">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Roster */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" /> Roster
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">
              {filled}/{data.max_seats} · {seatsLeft} open · {passed} passed
            </span>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>

        {/* Add student form */}
        {showAdd && (
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-700 mb-3">Add Student Manually</p>
            <form onSubmit={addStudent} className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <input required value={addFirst} onChange={(e) => setAddFirst(e.target.value)} placeholder="First name *" className={miniInput} />
              <input required value={addLast} onChange={(e) => setAddLast(e.target.value)} placeholder="Last name *" className={miniInput} />
              <input required type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="Email *" className={miniInput} />
              <input type="tel" value={addPhone} onChange={(e) => setAddPhone(e.target.value)} placeholder="Phone" className={miniInput} />
              <input value={addOrg} onChange={(e) => setAddOrg(e.target.value)} placeholder="Organization" className={miniInput} />
              <div className="flex gap-2">
                <button type="submit" disabled={adding} className="flex-1 h-9 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg">
                  {adding ? "Adding…" : "Add"}
                </button>
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 h-9 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-lg">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {filled === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">
            No students registered yet. Use &quot;Add Student&quot; or share the public sign-up link.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.registrations.map((reg) => (
              <div key={reg.id}>
                <div className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">
                      {reg.first_name} {reg.last_name}
                    </div>
                    <div className="text-xs text-gray-400 flex flex-wrap gap-3 mt-0.5">
                      <span>{reg.email}</span>
                      {reg.phone && <span>{reg.phone}</span>}
                      {reg.address && <span>{reg.address}</span>}
                      {reg.organization && <span>{reg.organization}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      Attended:
                      <AttendancePill value={reg.attended} onClick={() => toggleAttendance(reg, "attended")} />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      Passed:
                      <AttendancePill value={reg.passed} onClick={() => toggleAttendance(reg, "passed")} />
                    </div>
                    <button
                      onClick={() => setExpanded(expanded === reg.id ? null : reg.id)}
                      className="text-xs text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                    >
                      Card info
                    </button>
                    <button
                      onClick={() => removeStudent(reg.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                      title="Remove student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded card info */}
                {expanded === reg.id && (
                  <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 mt-3 mb-2">AHA Card Information</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-xs text-gray-400">Card Number</label>
                        <input
                          value={cardEdits[reg.id]?.card_number ?? reg.card_number ?? ""}
                          onChange={(e) => setCardEdits((p) => ({ ...p, [reg.id]: { ...p[reg.id], card_number: e.target.value } }))}
                          className={miniInput + " mt-1"}
                          placeholder="AHA-XXXXXXXX"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Issue Date</label>
                        <input
                          type="date"
                          value={cardEdits[reg.id]?.card_issued_at ?? reg.card_issued_at ?? ""}
                          onChange={(e) => setCardEdits((p) => ({ ...p, [reg.id]: { ...p[reg.id], card_issued_at: e.target.value } }))}
                          className={miniInput + " mt-1"}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Expiry Date</label>
                        <input
                          type="date"
                          value={cardEdits[reg.id]?.card_expires_at ?? reg.card_expires_at ?? ""}
                          onChange={(e) => setCardEdits((p) => ({ ...p, [reg.id]: { ...p[reg.id], card_expires_at: e.target.value } }))}
                          className={miniInput + " mt-1"}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400">Notes</label>
                        <input
                          value={cardEdits[reg.id]?.notes ?? reg.notes ?? ""}
                          onChange={(e) => setCardEdits((p) => ({ ...p, [reg.id]: { ...p[reg.id], notes: e.target.value } }))}
                          className={miniInput + " mt-1"}
                          placeholder="Any notes…"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => saveCardInfo(reg.id)}
                      disabled={savingCard === reg.id}
                      className="mt-3 text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-lg transition-colors"
                    >
                      {savingCard === reg.id ? "Saving…" : "Save Card Info"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const miniInput = "w-full h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white";
