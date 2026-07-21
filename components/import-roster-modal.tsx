"use client";

import { useState } from "react";
import { Upload, X, AlertTriangle, CheckCircle2 } from "lucide-react";

interface ParsedRow {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  valid: boolean;
  reason?: string;
  include: boolean;
}

export default function ImportRosterModal({
  classId,
  onImported,
}: {
  classId: number;
  onImported: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"select" | "preview" | "done">("select");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [result, setResult] = useState<{ added: number; skipped: { row: string; reason: string }[] } | null>(null);

  const reset = () => {
    setStep("select");
    setFile(null);
    setError("");
    setRows([]);
    setResult(null);
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/admin/classes/${classId}/import`, { method: "POST", body: fd });
    const d = await res.json().catch(() => null);
    setUploading(false);
    if (!res.ok) {
      setError(d?.error ?? "Failed to read that spreadsheet.");
      return;
    }
    setRows((d.rows as Omit<ParsedRow, "include">[]).map((r) => ({ ...r, include: r.valid })));
    setStep("preview");
  };

  const updateRow = (i: number, field: keyof ParsedRow, value: string) => {
    setRows((rs) =>
      rs.map((r, idx) => {
        if (idx !== i) return r;
        const next = { ...r, [field]: value };
        next.valid = Boolean(next.first_name.trim() && next.last_name.trim() && next.email.trim());
        return next;
      })
    );
  };

  const commit = async () => {
    setCommitting(true);
    setError("");
    const included = rows.filter((r) => r.include);
    const res = await fetch(`/api/admin/classes/${classId}/import/commit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: included }),
    });
    const d = await res.json().catch(() => null);
    setCommitting(false);
    if (!res.ok) {
      setError(d?.error ?? "Import failed.");
      return;
    }
    setResult(d);
    setStep("done");
    onImported();
  };

  const includedCount = rows.filter((r) => r.include).length;
  const includedValid = rows.filter((r) => r.include && !r.valid).length === 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
      >
        <Upload className="w-4 h-4" /> Import Spreadsheet
      </button>

      {open && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Import Roster from Spreadsheet</h2>
            <button onClick={close} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto px-5 py-4 space-y-4 flex-1">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            {step === "select" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Upload an .xlsx, .xls, or .csv roster file. Claude will figure out which columns map to name, email,
                  phone, and address — you'll get a chance to review before anything is added.
                </p>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-red-50 file:text-red-600 file:font-medium hover:file:bg-red-100"
                />
                <button
                  onClick={upload}
                  disabled={!file || uploading}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {uploading ? "Reading & mapping columns…" : "Upload & Map"}
                </button>
              </div>
            )}

            {step === "preview" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  {includedCount} of {rows.length} row{rows.length === 1 ? "" : "s"} selected to import. Fix or
                  uncheck any row before importing.
                </p>
                <div className="border border-gray-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="px-2 py-2 text-left w-8"></th>
                        <th className="px-2 py-2 text-left">First</th>
                        <th className="px-2 py-2 text-left">Last</th>
                        <th className="px-2 py-2 text-left">Email</th>
                        <th className="px-2 py-2 text-left">Phone</th>
                        <th className="px-2 py-2 text-left w-6"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {rows.map((r, i) => (
                        <tr key={i} className={r.include ? "" : "opacity-40"}>
                          <td className="px-2 py-1.5">
                            <input
                              type="checkbox"
                              checked={r.include}
                              onChange={(e) =>
                                setRows((rs) => rs.map((row, idx) => (idx === i ? { ...row, include: e.target.checked } : row)))
                              }
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              value={r.first_name}
                              onChange={(e) => updateRow(i, "first_name", e.target.value)}
                              className="w-full border border-gray-200 rounded px-1.5 py-1 text-sm"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              value={r.last_name}
                              onChange={(e) => updateRow(i, "last_name", e.target.value)}
                              className="w-full border border-gray-200 rounded px-1.5 py-1 text-sm"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              value={r.email}
                              onChange={(e) => updateRow(i, "email", e.target.value)}
                              className="w-full border border-gray-200 rounded px-1.5 py-1 text-sm"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              value={r.phone}
                              onChange={(e) => updateRow(i, "phone", e.target.value)}
                              className="w-full border border-gray-200 rounded px-1.5 py-1 text-sm"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            {r.include && !r.valid && (
                              <span title={r.reason ?? "Missing required field"}>
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep("select")}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Back
                  </button>
                  <button
                    onClick={commit}
                    disabled={includedCount === 0 || !includedValid || committing}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    {committing ? "Importing…" : `Add ${includedCount} Student${includedCount === 1 ? "" : "s"} to Class`}
                  </button>
                </div>
              </div>
            )}

            {step === "done" && result && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  Added {result.added} student{result.added === 1 ? "" : "s"}.
                </div>
                {result.skipped.length > 0 && (
                  <div className="text-sm text-gray-500">
                    <p className="font-medium text-gray-700 mb-1">Skipped ({result.skipped.length}):</p>
                    <ul className="space-y-0.5">
                      {result.skipped.map((s, i) => (
                        <li key={i}>
                          {s.row} — {s.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={close}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      )}
    </>
  );
}
