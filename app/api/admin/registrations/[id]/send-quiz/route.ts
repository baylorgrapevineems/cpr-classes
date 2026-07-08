import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { sendQuizEmail } from "@/lib/email";
import { readFileSync } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const { id } = await params;
  const regId = parseInt(id);
  const sql = getDb();

  try {
    const rows = await sql`
      SELECT r.id, r.first_name, r.email, r.quiz_token, r.quiz_version,
             c.title, c.class_date,
             (SELECT COUNT(*) FROM registrations WHERE class_id = r.class_id) - 1 AS peer_index
      FROM registrations r
      JOIN classes c ON c.id = r.class_id
      WHERE r.id = ${regId}
      LIMIT 1
    `;

    if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const reg = rows[0];

    // Load reference PDFs
    let ref1Base64: string, ref2Base64: string;
    try {
      ref1Base64 = readFileSync(join(process.cwd(), "public", "cpr-reference-1.pdf")).toString("base64");
      ref2Base64 = readFileSync(join(process.cwd(), "public", "cpr-reference-2.pdf")).toString("base64");
    } catch {
      return NextResponse.json({ error: "Reference PDFs not found" }, { status: 500 });
    }

    // Keep existing version if already assigned, otherwise pick based on reg id (alternate C/D)
    const version = (reg.quiz_version as "C" | "D") ?? (regId % 2 === 0 ? "C" : "D");
    const token = (reg.quiz_token as string | null) ?? randomBytes(24).toString("hex");

    await sql`
      UPDATE registrations
      SET quiz_token = ${token}, quiz_sent_at = NOW(), quiz_version = ${version}
      WHERE id = ${regId}
    `;

    const baseUrl = req.headers.get("origin") ?? "https://cpr.baylorgrapevineems.com";
    const classDate = new Date(reg.class_date).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric",
    });

    await sendQuizEmail({
      to:         String(reg.email),
      firstName:  String(reg.first_name),
      classTitle: String(reg.title),
      classDate,
      token,
      baseUrl,
      ref1Base64,
      ref2Base64,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
