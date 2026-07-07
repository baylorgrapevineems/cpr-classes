"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Calendar,
  Clock,
  MapPin,
  User,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { CPRClass } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";

type FormState = "idle" | "submitting" | "success" | "error";

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [cls, setCls] = useState<CPRClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(`/api/classes/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((d) => { if (d) setCls(d); })
      .finally(() => setLoading(false));
  }, [id]);

  const seatsLeft = cls ? cls.max_seats - (cls.registered_count ?? 0) : 0;
  const isFull = seatsLeft <= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/classes/${id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, phone, organization }),
      });
      const json = await res.json();
      if (!res.ok) { setErrorMsg(json.error ?? "Registration failed."); setFormState("error"); return; }
      setFormState("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setFormState("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Baylor Grapevine EMS</p>
            <p className="text-xs text-gray-500 leading-tight">AHA BLS CPR Classes</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to all classes
        </Link>

        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-16 justify-center">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
            Loading class…
          </div>
        )}

        {notFound && (
          <div className="text-center py-16">
            <p className="font-medium text-gray-700">Class not found.</p>
            <Link href="/" className="text-sm text-red-600 underline mt-2 inline-block">View all classes</Link>
          </div>
        )}

        {cls && (
          <div className="grid gap-6 md:grid-cols-5">
            {/* Class info */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-6">
                {cls.is_cancelled && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    This class has been cancelled.
                  </div>
                )}
                <span className="inline-block text-xs font-semibold text-red-700 bg-red-50 border border-red-100 rounded px-2 py-0.5 mb-3">
                  AHA {cls.course_type}
                </span>
                <h1 className="font-bold text-gray-900 text-lg mb-4">{cls.title}</h1>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                    {formatDate(cls.class_date)}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                    {formatTime(cls.start_time)}
                    {cls.end_time && <> – {formatTime(cls.end_time)}</>}
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                    <span>
                      {cls.location}
                      {cls.address && <><br /><span className="text-gray-400">{cls.address}</span></>}
                    </span>
                  </div>
                  {cls.instructor_name && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                      {cls.instructor_name}
                    </div>
                  )}
                </div>

                {!cls.is_cancelled && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400">Availability</p>
                    <p className={`text-sm font-semibold mt-0.5 ${isFull ? "text-gray-500" : "text-emerald-600"}`}>
                      {isFull ? "Class full" : `${seatsLeft} of ${cls.max_seats} seats available`}
                    </p>
                  </div>
                )}

                {cls.description && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-1">About this class</p>
                    <p className="text-sm text-gray-600">{cls.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Registration form */}
            <div className="md:col-span-3">
              {formState === "success" ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h2 className="font-bold text-gray-900 text-lg mb-2">You&apos;re registered!</h2>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    We&apos;ve received your registration for{" "}
                    <strong>{cls.title}</strong> on{" "}
                    <strong>{formatDate(cls.class_date)}</strong>. See you there!
                  </p>
                  <p className="text-xs text-gray-400 mt-4">
                    A confirmation may be sent to <strong>{email}</strong> if we have it on file.
                  </p>
                  <Link
                    href="/"
                    className="inline-block mt-6 text-sm text-red-600 hover:text-red-700 underline"
                  >
                    View all classes
                  </Link>
                </div>
              ) : cls.is_cancelled ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                  <p className="font-medium text-gray-700">Registration is closed for this class.</p>
                  <Link href="/" className="inline-block mt-4 text-sm text-red-600 underline">
                    View other classes
                  </Link>
                </div>
              ) : isFull ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <p className="font-medium text-gray-700">This class is full.</p>
                  <Link href="/" className="inline-block mt-4 text-sm text-red-600 underline">
                    View other classes
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-bold text-gray-900 text-base mb-5">Register for this class</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-600">First Name *</label>
                        <input
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Jane"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-600">Last Name *</label>
                        <input
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Smith"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600">Email Address *</label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="jane@hospital.org"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="(817) 555-0100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-gray-600">Organization / Employer</label>
                      <input
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Baylor Scott & White"
                      />
                    </div>

                    {formState === "error" && (
                      <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        {errorMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={formState === "submitting"}
                      className="w-full h-11 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      {formState === "submitting" ? "Registering…" : "Complete Registration"}
                    </button>
                    <p className="text-xs text-gray-400 text-center">
                      * Required fields
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 mt-16 py-8 text-center text-xs text-gray-400">
        Baylor Grapevine EMS · AHA Training Center
      </footer>
    </div>
  );
}
