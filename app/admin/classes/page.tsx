"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Pencil,
  ChevronRight,
  AlertTriangle,
  EyeOff,
  BadgeCheck,
} from "lucide-react";
import { CPRClass } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((parseDate(dateStr).getTime() - today.getTime()) / 86400000);
}

function DaysBadge({ dateStr }: { dateStr: string }) {
  const d = daysUntil(dateStr);
  if (d === 0)
    return <span className="text-xs font-semibold text-white bg-red-600 px-2 py-0.5 rounded-full">Today</span>;
  if (d === 1)
    return <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Tomorrow</span>;
  if (d <= 7)
    return <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">In {d} days</span>;
  return <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">In {d} days</span>;
}

function ClassCard({ cls, past }: { cls: CPRClass; past?: boolean }) {
  const filled = cls.registered_count ?? 0;
  const pct = Math.round((filled / cls.max_seats) * 100);
  const isFull = filled >= cls.max_seats;

  return (
    <Link
      href={`/admin/classes/${cls.id}`}
      className={`block border rounded-xl p-4 hover:shadow-sm transition-all group ${
        cls.is_cancelled
          ? "border-gray-100 bg-gray-50 opacity-60"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left — date block */}
        <div className={`shrink-0 w-14 text-center rounded-lg py-2 ${past ? "bg-gray-100" : "bg-red-50"}`}>
          <div className={`text-xs font-semibold uppercase tracking-wide ${past ? "text-gray-400" : "text-red-500"}`}>
            {parseDate(cls.class_date).toLocaleString("en-US", { month: "short" })}
          </div>
          <div className={`text-2xl font-bold leading-none mt-0.5 ${past ? "text-gray-400" : "text-red-700"}`}>
            {parseDate(cls.class_date).getDate()}
          </div>
          <div className={`text-xs ${past ? "text-gray-400" : "text-red-400"}`}>
            {parseDate(cls.class_date).getFullYear()}
          </div>
        </div>

        {/* Middle — class info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm group-hover:text-red-700 transition-colors">
              {cls.title}
            </h3>
            <span className="text-xs bg-red-50 text-red-700 border border-red-100 px-1.5 py-0.5 rounded">
              {cls.course_type}
            </span>
            {cls.is_completed && (
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                <BadgeCheck className="w-3 h-3" /> Done
              </span>
            )}
            {cls.is_cancelled && (
              <span className="inline-flex items-center gap-0.5 text-xs text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                <AlertTriangle className="w-3 h-3" /> Cancelled
              </span>
            )}
            {!cls.is_public && (
              <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">
                <EyeOff className="w-3 h-3" /> Hidden
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(cls.start_time)}{cls.end_time ? ` – ${formatTime(cls.end_time)}` : ""}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {cls.location}
            </span>
            {cls.instructor_name && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" /> {cls.instructor_name}
              </span>
            )}
          </div>
        </div>

        {/* Right — seats + actions */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          {!past && <DaysBadge dateStr={cls.class_date} />}
          <div className="flex items-center gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span className={`font-mono font-medium ${isFull ? "text-red-600" : "text-gray-700"}`}>
              {filled}/{cls.max_seats}
            </span>
          </div>
          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-400" : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0 self-center transition-colors" />
      </div>

      {/* Quick action strip */}
      <div
        className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100"
        onClick={(e) => e.preventDefault()}
      >
        <Link
          href={`/admin/classes/${cls.id}/edit`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit Class
        </Link>
        <Link
          href={`/admin/classes/${cls.id}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <Users className="w-3.5 h-3.5" /> Roster
        </Link>
        <span className="text-xs text-gray-300 ml-auto">
          {formatDate(cls.class_date).split(",").slice(1).join(",").trim()}
        </span>
      </div>
    </Link>
  );
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<CPRClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllPast, setShowAllPast] = useState(false);

  useEffect(() => {
    fetch("/api/admin/classes")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setClasses(d);
        else setError(d.error ?? "Failed to load classes.");
      })
      .catch(() => setError("Failed to load classes."))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split("T")[0];
  // upcoming: soonest first; past: most recent first
  const upcoming = classes
    .filter((c) => c.class_date >= today)
    .sort((a, b) => a.class_date.localeCompare(b.class_date) || a.start_time.localeCompare(b.start_time));
  const past = classes
    .filter((c) => c.class_date < today)
    .sort((a, b) => b.class_date.localeCompare(a.class_date) || b.start_time.localeCompare(a.start_time));

  const visiblePast = showAllPast ? past : past.slice(0, 5);

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-gray-400 text-sm gap-2">
      <div className="w-4 h-4 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin" /> Loading…
    </div>
  );

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}{" "}
          <a href="/api/db-init" className="underline">Initialize DB</a>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {upcoming.length} upcoming · {past.length} past
          </p>
        </div>
        <Link
          href="/admin/classes/new"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> New Class
        </Link>
      </div>

      {/* Upcoming */}
      <section>
        <h2 className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          <Calendar className="w-3.5 h-3.5 text-red-500" /> Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <div className="text-center py-12 bg-white border border-dashed border-gray-200 rounded-xl text-sm text-gray-400">
            No upcoming classes.{" "}
            <Link href="/admin/classes/new" className="text-red-600 hover:underline">Schedule one →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((cls) => <ClassCard key={cls.id} cls={cls} />)}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            <Clock className="w-3.5 h-3.5 text-gray-400" /> Past Classes
          </h2>
          <div className="space-y-3">
            {visiblePast.map((cls) => <ClassCard key={cls.id} cls={cls} past />)}
          </div>
          {past.length > 5 && (
            <button
              onClick={() => setShowAllPast((v) => !v)}
              className="mt-3 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              {showAllPast ? "Show less" : `Show ${past.length - 5} more past classes`}
            </button>
          )}
        </section>
      )}
    </div>
  );
}
