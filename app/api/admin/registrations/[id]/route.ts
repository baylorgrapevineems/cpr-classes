import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminAuthenticated, unauthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  try {
    const { id } = await params;
    const regId = parseInt(id);
    const sql = getDb();
    const body = await req.json();

    // Fetch current row to merge
    const rows = await sql`SELECT * FROM registrations WHERE id = ${regId}`;
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const current = rows[0];

    const attended = "attended" in body ? body.attended : current.attended;
    const passed = "passed" in body ? body.passed : current.passed;
    const card_number = "card_number" in body ? (body.card_number || null) : current.card_number;
    const card_issued_at = "card_issued_at" in body ? (body.card_issued_at || null) : current.card_issued_at;
    const card_expires_at = "card_expires_at" in body ? (body.card_expires_at || null) : current.card_expires_at;
    const notes = "notes" in body ? (body.notes || null) : current.notes;

    await sql`
      UPDATE registrations SET
        attended = ${attended},
        passed = ${passed},
        card_number = ${card_number},
        card_issued_at = ${card_issued_at},
        card_expires_at = ${card_expires_at},
        notes = ${notes}
      WHERE id = ${regId}
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
    await sql`DELETE FROM registrations WHERE id = ${parseInt(id)}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
