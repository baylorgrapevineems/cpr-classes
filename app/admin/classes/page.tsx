import Link from "next/link";
import { getDb } from "@/lib/db";
import { CPRClass } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils";
import { Plus, Calendar, Users, Pencil, Eye } from "lucide-react";

async function getAllClasses(): Promise<{ classes: CPRClass[]; error?: string }> {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT
        c.*,
        COUNT(r.id)::int AS registered_count
      FROM classes c
      LEFT JOIN registrations r ON r.class_id = c.id
      GROUP BY c.id
      ORDER BY c.class_date DESC, c.start_time DESC
    `;
    return { classes: rows as CPRClass[] };
  } catch (e) {
    return { classes: [], error: String(e) };
  }
}

function ClassTable({ rows, emptyLabel }: { rows: CPRClass[]; emptyLabel: string }) {
  if (rows.length === 0) {
    return <div className="text-center py-10 text-sm text-gray-400">{emptyLabel}</div>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left font-medium text-xs text-gray-400 uppercase tracking-wide pb-2 pr-4">Date</th>
            <th className="text-left font-medium text-xs text-gray-400 uppercase tracking-wide pb-2 pr-4">Title</th>
            <th className="text-left font-medium text-xs text-gray-400 uppercase tracking-wide pb-2 pr-4">Location</th>
            <th className="text-left font-medium text-xs text-gray-400 uppercase tracking-wide pb-2 pr-4">Instructor</th>
            <th className="text-right font-medium text-xs text-gray-400 uppercase tracking-wide pb-2 pr-4">Seats</th>
            <th className="text-right font-medium text-xs text-gray-400 uppercase tracking-wide pb-2">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((cls) => {
            const filled = cls.registered_count ?? 0;
            const pct = Math.round((filled / cls.max_seats) * 100);
            return (
              <tr key={cls.id} className={`hover:bg-gray-50 ${cls.is_cancelled ? "opacity-50" : ""}`}>
                <td className="py-3 pr-4">
                  <div className="font-medium text-gray-900">{formatDate(cls.class_date).split(",")[0]}</div>
                  <div className="text-xs text-gray-400">{cls.class_date} · {formatTime(cls.start_time)}</div>
                </td>
                <td className="py-3 pr-4">
                  <div className="font-medium text-gray-900">{cls.title}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded">{cls.course_type}</span>
                    {cls.is_cancelled && <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Cancelled</span>}
                    {!cls.is_public && <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">Hidden</span>}
                  </div>
                </td>
                <td className="py-3 pr-4 text-gray-600">{cls.location}</td>
                <td className="py-3 pr-4 text-gray-600">
                  {cls.instructor_name ?? <span className="text-gray-300">—</span>}
                </td>
                <td className="py-3 pr-4 text-right">
                  <div className="text-gray-900 font-mono">{filled}/{cls.max_seats}</div>
                  <div className="flex justify-end mt-1">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-400" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/classes/${cls.id}`}
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Roster
                    </Link>
                    <Link
                      href={`/admin/classes/${cls.id}/edit`}
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminClassesPage() {
  const { classes, error } = await getAllClasses();
  const today = new Date().toISOString().split("T")[0];
  const upcoming = classes.filter((c) => c.class_date >= today);
  const past = classes.filter((c) => c.class_date < today);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          Database error: {error}. Visit <a href="/api/db-init" className="underline">/api/db-init</a> to initialize.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{classes.length} total · {upcoming.length} upcoming</p>
        </div>
        <Link
          href="/admin/classes/new"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> New Class
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
          <Calendar className="w-4 h-4 text-red-500" /> Upcoming
        </h2>
        <ClassTable rows={upcoming} emptyLabel="No upcoming classes. Schedule one using 'New Class'." />
      </div>

      {past.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
            <Users className="w-4 h-4 text-gray-400" /> Past Classes
          </h2>
          <ClassTable rows={past} emptyLabel="No past classes." />
        </div>
      )}
    </div>
  );
}
