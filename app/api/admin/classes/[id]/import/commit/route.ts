import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/auth";
import { getDb } from "@/lib/db";

interface ImportRow {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const { id } = await params;
  const classId = parseInt(id);
  const sql = getDb();

  const body = await req.json();
  const rows: ImportRow[] = Array.isArray(body.rows) ? body.rows : [];

  const clsRows = await sql`
    SELECT c.max_seats, c.is_cancelled, COUNT(r.id)::int AS registered_count
    FROM classes c
    LEFT JOIN registrations r ON r.class_id = c.id
    WHERE c.id = ${classId}
    GROUP BY c.id, c.max_seats, c.is_cancelled
  `;
  if (!clsRows[0]) return NextResponse.json({ error: "Class not found." }, { status: 404 });
  const cls = clsRows[0];
  if (cls.is_cancelled) return NextResponse.json({ error: "This class has been cancelled." }, { status: 400 });

  let remaining = cls.max_seats - cls.registered_count;
  let added = 0;
  const skipped: { row: string; reason: string }[] = [];

  for (const row of rows) {
    const label = `${row.first_name} ${row.last_name}`.trim() || row.email;
    const first_name = row.first_name?.trim();
    const last_name = row.last_name?.trim();
    const email = row.email?.trim().toLowerCase();

    if (!first_name || !last_name || !email) {
      skipped.push({ row: label, reason: "Missing required field" });
      continue;
    }
    if (remaining <= 0) {
      skipped.push({ row: label, reason: "Class is full" });
      continue;
    }

    const dup = await sql`SELECT id FROM registrations WHERE class_id = ${classId} AND email = ${email}`;
    if (dup.length > 0) {
      skipped.push({ row: label, reason: "Already registered for this class" });
      continue;
    }

    await sql`
      INSERT INTO registrations (class_id, first_name, last_name, email, phone, address, notes)
      VALUES (${classId}, ${first_name}, ${last_name}, ${email},
              ${row.phone?.trim() || null}, ${row.address?.trim() || null}, ${row.notes?.trim() || null})
    `;
    added++;
    remaining--;
  }

  return NextResponse.json({ ok: true, added, skipped });
}
