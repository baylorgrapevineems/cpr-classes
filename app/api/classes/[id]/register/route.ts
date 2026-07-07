import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const classId = parseInt(id);
    const sql = getDb();

    // Verify class exists and has seats
    const rows = await sql`
      SELECT c.max_seats, c.is_cancelled, COUNT(r.id)::int AS registered_count
      FROM classes c
      LEFT JOIN registrations r ON r.class_id = c.id
      WHERE c.id = ${classId}
      GROUP BY c.id, c.max_seats, c.is_cancelled
    `;
    if (!rows[0]) return NextResponse.json({ error: "Class not found." }, { status: 404 });
    const cls = rows[0];
    if (cls.is_cancelled) return NextResponse.json({ error: "This class has been cancelled." }, { status: 400 });
    if (cls.registered_count >= cls.max_seats) return NextResponse.json({ error: "This class is full." }, { status: 400 });

    const body = await req.json();
    const { first_name, last_name, email, phone, organization } = body;

    if (!first_name?.trim() || !last_name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "First name, last name, and email are required." }, { status: 400 });
    }

    // Check for duplicate email in this class
    const dup = await sql`
      SELECT id FROM registrations WHERE class_id = ${classId} AND email = ${email.trim().toLowerCase()}
    `;
    if (dup.length > 0) {
      return NextResponse.json({ error: "This email address is already registered for this class." }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO registrations (class_id, first_name, last_name, email, phone, organization)
      VALUES (
        ${classId},
        ${first_name.trim()},
        ${last_name.trim()},
        ${email.trim().toLowerCase()},
        ${phone?.trim() || null},
        ${organization?.trim() || null}
      )
      RETURNING id
    `;
    return NextResponse.json({ ok: true, id: result[0].id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
