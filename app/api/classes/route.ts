import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT
        c.*,
        COUNT(r.id)::int AS registered_count
      FROM classes c
      LEFT JOIN registrations r ON r.class_id = c.id
      WHERE c.class_date >= CURRENT_DATE
        AND c.is_public = TRUE
      GROUP BY c.id
      ORDER BY c.class_date ASC, c.start_time ASC
    `;
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
