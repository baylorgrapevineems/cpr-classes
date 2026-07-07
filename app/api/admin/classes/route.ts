import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminAuthenticated, unauthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();
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
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  try {
    const sql = getDb();
    const body = await req.json();
    const {
      title, course_type, class_date, start_time, end_time,
      location, address, instructor_name, max_seats, description, is_public,
    } = body;

    if (!title?.trim() || !class_date || !start_time || !location?.trim()) {
      return NextResponse.json({ error: "Title, date, start time, and location are required." }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO classes
        (title, course_type, class_date, start_time, end_time, location, address, instructor_name, max_seats, description, is_public)
      VALUES (
        ${title.trim()},
        ${course_type ?? "BLS"},
        ${class_date},
        ${start_time},
        ${end_time || null},
        ${location.trim()},
        ${address?.trim() || null},
        ${instructor_name?.trim() || null},
        ${max_seats ?? 12},
        ${description?.trim() || null},
        ${is_public ?? true}
      )
      RETURNING id
    `;
    return NextResponse.json({ ok: true, id: result[0].id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
