import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdminAuthenticated, unauthorized } from "@/lib/auth";
import { sendQuizEmail } from "@/lib/email";
import { randomBytes } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const { id } = await params;
  const classId = parseInt(id);
  const sql = getDb();

  const body = await req.json().catch(() => ({}));
  const onlyUnsent: boolean = body.only_unsent !== false;

  const cls = await sql`SELECT title, class_date FROM classes WHERE id = ${classId}`;
  if (!cls[0]) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  const classTitle = cls[0].title as string;
  const classDate = new Date(cls[0].class_date).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const regs = await sql`
    SELECT id, first_name, email, quiz_sent_at
    FROM registrations
    WHERE class_id = ${classId}
    ${onlyUnsent ? sql`AND quiz_sent_at IS NULL` : sql``}
    ORDER BY registered_at ASC
  `;

  if (regs.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0, message: "No students to send to" });
  }

  // Load reference PDFs from public folder
  let ref1Base64: string;
  let ref2Base64: string;
  try {
    const ref1 = readFileSync(join(process.cwd(), "public", "cpr-reference-1.pdf"));
    const ref2 = readFileSync(join(process.cwd(), "public", "cpr-reference-2.pdf"));
    ref1Base64 = ref1.toString("base64");
    ref2Base64 = ref2.toString("base64");
  } catch {
    return NextResponse.json({ error: "Reference PDFs not found in public folder" }, { status: 500 });
  }

  const baseUrl = req.headers.get("origin") ?? "https://cpr.baylorgrapevineems.com";
  const versions: Array<"C" | "D"> = ["C", "D"];

  let sent = 0;
  let skipped = 0;

  for (let i = 0; i < regs.length; i++) {
    const reg = regs[i];
    try {
      const token = randomBytes(24).toString("hex");
      const version = versions[i % 2]; // alternate C/D

      await sql`
        UPDATE registrations
        SET quiz_token = ${token}, quiz_sent_at = NOW(), quiz_version = ${version}
        WHERE id = ${reg.id}
      `;

      await sendQuizEmail({
        to: reg.email as string,
        firstName: reg.first_name as string,
        classTitle,
        classDate,
        token,
        baseUrl,
        ref1Base64,
        ref2Base64,
      });

      sent++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ sent, skipped });
}
