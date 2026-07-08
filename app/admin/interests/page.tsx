"use client";

import { useEffect, useState } from "react";
import { Calendar, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import type { CardRequest, CPRClass } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function InterestsPage() {
  const [requests, setRequests] = useState<CardRequest[]>([]);
  const [classes,  setClasses]  = useState<CPRClass[]>([]);
  const [loading,  setLoading]  = useState(true);

  // Tracks which request has the assign UI open: { id: class_id_selected }
  const [assigning, setAssigning] = useState<Record<number, string>>({});
  const [busy,      setBusy]      = useState<number | null>(null);
  const [msg,       setMsg]       = useState<Record<number, string>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/card-requests").then(r => r.json()),
      fetch("/api/classes").then(r => r.json()),
    ]).then(([reqs, cls]) => {
      setRequests(Array.isArray(reqs) ? reqs : []);
      setClasses(Array.isArray(cls) ? cls : []);
    }).finally(() => setLoading(false));
  }, []);

  const toggleAssign = (id: number) =>
    setAssigning(a => ({ ...a, [id]: id in a ? undefined as unknown as string : "" }));

  async function assign(req: CardRequest) {
    const classId = assigning[req.id];
    if (!classId) return;
    setBusy(req.id);
    const res = await fetch(`/api/admin/card-requests/${req.id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ class_id: Number(classId) }),
    });
    setBusy(null);
    if (res.ok) {
      const cls = classes.find(c => c.id === Number(classId));
      setMsg(m => ({ ...m, [req.id]: `Added to ${cls?.title ?? "class"}` }));
      setRequests(reqs => reqs.map(r =>
        r.id === req.id ? { ...r, class_id: Number(classId), class_title: cls?.title } : r
      ));
      setAssigning(a => { const n = { ...a }; delete n[req.id]; return n; });
    } else {
      setMsg(m => ({ ...m, [req.id]: "Failed — try again" }));
    }
  }

  const pending  = requests.filter(r => !r.class_id);
  const assigned = requests.filter(r => !!r.class_id);

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-3 text-gray-400 text-sm">
      <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
      Loading…
    </div>
  );

  function RequestCard({ req }: { req: CardRequest }) {
    const isAssigned = !!req.class_id;
    const open = req.id in assigning;

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900">{req.first_name} {req.last_name}</p>
            <p className="text-sm text-gray-500">{req.email}{req.phone ? ` · ${req.phone}` : ""}</p>
            {req.notes && <p className="text-xs text-gray-400 mt-1 italic">{req.notes}</p>}
            <p className="text-xs text-gray-300 mt-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              {new Date(req.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <div className="shrink-0 text-right">
            {isAssigned ? (
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Assigned
              </div>
            ) : (
              <button
                onClick={() => toggleAssign(req.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800 transition-colors"
              >
                Add to class {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {isAssigned && req.class_title && (
          <p className="text-xs text-gray-400">
            Registered for: <span className="font-medium text-gray-600">{req.class_title}</span>
            {req.class_date && ` · ${formatDate(req.class_date)}`}
          </p>
        )}

        {msg[req.id] && (
          <p className="text-xs text-emerald-600 font-medium">{msg[req.id]}</p>
        )}

        {open && !isAssigned && (
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <label className="text-xs font-medium text-gray-600">Select an upcoming class:</label>
            <select
              value={assigning[req.id] ?? ""}
              onChange={e => setAssigning(a => ({ ...a, [req.id]: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">— pick a class —</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.title} · {formatDate(c.class_date)}
                </option>
              ))}
            </select>
            <button
              disabled={!assigning[req.id] || busy === req.id}
              onClick={() => assign(req)}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              {busy === req.id ? "Assigning…" : "Confirm"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Card Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          People who expressed interest in getting a CPR card but haven't registered for a class.
        </p>
      </div>

      {requests.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
          No card requests yet.
        </div>
      )}

      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Pending ({pending.length})
          </h2>
          {pending.map(r => <RequestCard key={r.id} req={r} />)}
        </section>
      )}

      {assigned.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Assigned ({assigned.length})
          </h2>
          {assigned.map(r => <RequestCard key={r.id} req={r} />)}
        </section>
      )}
    </div>
  );
}
