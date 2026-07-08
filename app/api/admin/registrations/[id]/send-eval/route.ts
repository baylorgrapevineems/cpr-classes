import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { sendEvalEmail } from "@/lib/email";
import { formatDate } from "@/lib/utils";
import crypto from "crypto";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const { id } = await params;
  const regId = parseInt(id);
  const sql = getDb();

  try {
    const rows = await sql`
      SELECT r.id, r.first_name, r.email, r.eval_token,
             c.title, c.class_date
      FROM registrations r
      JOIN classes c ON c.id = r.class_id
      WHERE r.id = ${regId}
      LIMIT 1
    `;

    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const reg = rows[0];
    let token = reg.eval_token as string | null;
    if (!token) {
      token = crypto.randomBytes(16).toString("hex");
      await sql`UPDATE registrations SET eval_token = ${token} WHERE id = ${regId}`;
    }

    const baseUrl = req.headers.get("origin") ?? "https://cpr.baylorgrapevineems.com";
    await sendEvalEmail({
      to:         String(reg.email),
      firstName:  String(reg.first_name),
      classTitle: String(reg.title),
      classDate:  formatDate(reg.class_date),
      token,
      baseUrl,
    });

    await sql`UPDATE registrations SET eval_sent_at = NOW() WHERE id = ${regId}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
