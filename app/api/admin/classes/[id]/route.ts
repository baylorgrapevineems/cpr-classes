import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminAuthenticated, unauthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  try {
    const { id } = await params;
    const sql = getDb();
    const classes = await sql`SELECT * FROM classes WHERE id = ${parseInt(id)}`;
    if (!classes[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const registrations = await sql`
      SELECT * FROM registrations WHERE class_id = ${parseInt(id)} ORDER BY registered_at ASC
    `;
    return NextResponse.json({ ...classes[0], registrations });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  try {
    const { id } = await params;
    const classId = parseInt(id);
    const sql = getDb();
    const body = await req.json();

    // Fetch current row to merge with updates
    const rows = await sql`SELECT * FROM classes WHERE id = ${classId}`;
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const current = rows[0];

    const title = body.title ?? current.title;
    const course_type = body.course_type ?? current.course_type;
    const class_date = body.class_date ?? current.class_date;
    const start_time = body.start_time ?? current.start_time;
    const end_time = "end_time" in body ? (body.end_time || null) : current.end_time;
    const location = body.location ?? current.location;
    const address = "address" in body ? (body.address || null) : current.address;
    const instructor_name = "instructor_name" in body ? (body.instructor_name || null) : current.instructor_name;
    const max_seats = body.max_seats ?? current.max_seats;
    const description = "description" in body ? (body.description || null) : current.description;
    const is_public = "is_public" in body ? body.is_public : current.is_public;
    const is_cancelled = "is_cancelled" in body ? body.is_cancelled : current.is_cancelled;

    await sql`
      UPDATE classes SET
        title = ${title},
        course_type = ${course_type},
        class_date = ${class_date},
        start_time = ${start_time},
        end_time = ${end_time},
        location = ${location},
        address = ${address},
        instructor_name = ${instructor_name},
        max_seats = ${max_seats},
        description = ${description},
        is_public = ${is_public},
        is_cancelled = ${is_cancelled}
      WHERE id = ${classId}
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  try {
    const { id } = await params;
    const sql = getDb();
    await sql`DELETE FROM classes WHERE id = ${parseInt(id)}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
