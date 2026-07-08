import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const sql = getDb();
  const rows = await sql`
    SELECT cr.*, c.title AS class_title, c.class_date
    FROM card_requests cr
    LEFT JOIN classes c ON c.id = cr.class_id
    ORDER BY cr.created_at DESC
  `;
  return NextResponse.json(rows);
}
