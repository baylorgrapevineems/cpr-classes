import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const sql = getDb();
    const rows = await sql`
      SELECT
        c.*,
        COUNT(r.id)::int AS registered_count
      FROM classes c
      LEFT JOIN registrations r ON r.class_id = c.id
      WHERE c.id = ${parseInt(id)}
      GROUP BY c.id
    `;
    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
