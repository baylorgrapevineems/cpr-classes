"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MapPin, Clock, User, Calendar, ChevronRight, AlertCircle } from "lucide-react";
import { CPRClass } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

function seatsLeft(cls: CPRClass) {
  return cls.max_seats - (cls.registered_count ?? 0);
}

export default function PublicHomePage() {
  const [classes, setClasses] = useState<CPRClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/classes")
      .then((r) => r.json())
      .then((d) => setClasses(Array.isArray(d) ? d : []))
      .catch(() => setClasses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Baylor Grapevine EMS</p>
            <p className="text-xs text-gray-500 leading-tight">AHA BLS CPR Classes</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">BLS CPR Certification Classes</h1>
          <p className="text-gray-500 text-base max-w-2xl">
            AHA Basic Life Support (BLS) certification for healthcare providers. Classes are taught
            by certified AHA instructors from Baylor Grapevine EMS. Cards are issued same-day upon
            successful completion.
          </p>
          <div className="flex flex-wrap gap-4 mt-5 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              AHA Certified Instructors
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              Cards Issued Same Day
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              2-Year Certification
            </span>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Classes</h2>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400 text-sm">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
            Loading classes…
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
            <p className="font-medium text-gray-700">No upcoming classes scheduled</p>
            <p className="text-sm text-gray-400 mt-1">Check back soon or contact us for more information.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((cls) => {
              const left = seatsLeft(cls);
              const full = left <= 0;
              const almostFull = left > 0 && left <= 3;
              return (
                <div
                  key={cls.id}
                  className={`bg-white rounded-xl border shadow-none overflow-hidden ${
                    cls.is_cancelled ? "border-gray-200 opacity-60" : "border-gray-200"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        {cls.is_cancelled && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded px-2 py-0.5 mb-2">
                            <AlertCircle className="w-3 h-3" /> Cancelled
                          </span>
                        )}
                        <h3 className="font-semibold text-gray-900 text-base">{cls.title}</h3>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4 shrink-0 text-gray-400" />
                            {formatDate(cls.class_date)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4 shrink-0 text-gray-400" />
                            {formatTime(cls.start_time)}
                            {cls.end_time && <> – {formatTime(cls.end_time)}</>}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                            {cls.location}
                            {cls.address && <span className="text-gray-400"> · {cls.address}</span>}
                          </div>
                          {cls.instructor_name && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <User className="w-4 h-4 shrink-0 text-gray-400" />
                              {cls.instructor_name}
                            </div>
                          )}
                        </div>
                        {cls.description && (
                          <p className="mt-3 text-sm text-gray-500 line-clamp-2">{cls.description}</p>
                        )}
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-3 min-w-[120px]">
                        {!cls.is_cancelled && (
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              full
                                ? "bg-gray-100 text-gray-500"
                                : almostFull
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {full ? "Full" : almostFull ? `${left} seat${left !== 1 ? "s" : ""} left` : `${left} seats open`}
                          </span>
                        )}
                        {!cls.is_cancelled && !full && (
                          <Link
                            href={`/class/${cls.id}`}
                            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                          >
                            Sign Up <ChevronRight className="w-4 h-4" />
                          </Link>
                        )}
                        {(cls.is_cancelled || full) && (
                          <Link
                            href={`/class/${cls.id}`}
                            className="text-xs text-gray-400 hover:text-gray-600 underline"
                          >
                            View details
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 mt-16 py-8 text-center text-xs text-gray-400">
        Baylor Grapevine EMS · AHA Training Center
      </footer>
    </div>
  );
}
