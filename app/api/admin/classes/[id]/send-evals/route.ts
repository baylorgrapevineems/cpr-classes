import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { sendEvalEmail } from "@/lib/email";
import { formatDate } from "@/lib/utils";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const { id } = await params;
  const classId = parseInt(id);
  const sql = getDb();

  const [classRows, regRows] = await Promise.all([
    sql`SELECT * FROM classes WHERE id = ${classId}`,
    sql`SELECT * FROM registrations WHERE class_id = ${classId}`,
  ]);

  if (!classRows[0]) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  const cls  = classRows[0];
  const regs = regRows as Array<{ id: number; first_name: string; last_name: string; email: string; eval_token: string | null }>;

  const baseUrl = req.nextUrl.origin;
  const classDate = formatDate(cls.class_date);
  let sent = 0, skipped = 0;

  for (const reg of regs) {
    // Assign token if not already set
    let token = reg.eval_token;
    if (!token) {
      token = crypto.randomBytes(16).toString("hex");
      await sql`UPDATE registrations SET eval_token = ${token} WHERE id = ${reg.id}`;
    }

    try {
      await sendEvalEmail({
        to: reg.email,
        firstName: reg.first_name,
        classTitle: String(cls.title),
        classDate,
        token,
        baseUrl,
      });
      await sql`UPDATE registrations SET eval_sent_at = NOW() WHERE id = ${reg.id}`;
      sent++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ sent, skipped });
}
