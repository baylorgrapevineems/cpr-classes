import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const { id } = await params;
  const { class_id } = await req.json();
  if (!class_id) return NextResponse.json({ error: "class_id required" }, { status: 400 });

  const sql = getDb();
  const rows = await sql`SELECT * FROM card_requests WHERE id = ${id} LIMIT 1`;
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const cr = rows[0];

  // Create a registration (ignore conflict if they already registered)
  await sql`
    INSERT INTO registrations (class_id, first_name, last_name, email, phone, notes)
    VALUES (${class_id}, ${cr.first_name}, ${cr.last_name}, ${cr.email},
            ${cr.phone ?? null}, ${cr.notes ?? null})
    ON CONFLICT DO NOTHING
  `;

  // Mark the card request as handled
  await sql`UPDATE card_requests SET class_id = ${class_id} WHERE id = ${id}`;

  return NextResponse.json({ ok: true });
}
