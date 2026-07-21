import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const { id } = await params;
  const sql = getDb();
  await sql`DELETE FROM card_requests WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
