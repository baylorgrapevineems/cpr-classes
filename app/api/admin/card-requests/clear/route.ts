import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function POST() {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const sql = getDb();
  await sql`UPDATE card_requests SET seen_at = NOW() WHERE class_id IS NULL AND seen_at IS NULL`;
  return NextResponse.json({ ok: true });
}
