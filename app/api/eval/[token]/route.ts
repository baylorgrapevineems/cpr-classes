import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendEvalNotification } from "@/lib/email";

// GET — load class/student info for the form
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const sql = getDb();

  const rows = await sql`
    SELECT r.id, r.first_name, r.last_name, r.email, r.eval_token,
           c.title, c.class_date, c.location, c.instructor_name,
           e.id AS eval_id
    FROM registrations r
    JOIN classes c ON c.id = r.class_id
    LEFT JOIN evaluations e ON e.registration_id = r.id
    WHERE r.eval_token = ${token}
    LIMIT 1
  `;

  if (!rows[0]) return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

// POST — submit evaluation
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const sql = getDb();

  const regRows = await sql`
    SELECT r.id, r.first_name, r.last_name, e.id AS eval_id,
           c.title, c.class_date
    FROM registrations r
    JOIN classes c ON c.id = r.class_id
    LEFT JOIN evaluations e ON e.registration_id = r.id
    WHERE r.eval_token = ${token}
    LIMIT 1
  `;

  if (!regRows[0]) return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  if (regRows[0].eval_id) return NextResponse.json({ error: "Already submitted" }, { status: 409 });

  const body = await req.json();
  const regId = regRows[0].id;

  await sql`
    INSERT INTO evaluations (
      registration_id,
      inst_q1, inst_q2, inst_q3,
      content_q1, content_q2, content_q3, content_q4, content_q5,
      skill_q1, skill_q2, skill_q3, skill_q4,
      comment_learning, comment_strengths, comment_future
    ) VALUES (
      ${regId},
      ${body.inst_q1 ?? null}, ${body.inst_q2 ?? null}, ${body.inst_q3 ?? null},
      ${body.content_q1 ?? null}, ${body.content_q2 ?? null}, ${body.content_q3 ?? null},
      ${body.content_q4 ?? null}, ${body.content_q5 ?? null},
      ${body.skill_q1 ?? null}, ${body.skill_q2 ?? null}, ${body.skill_q3 ?? null}, ${body.skill_q4 ?? null},
      ${body.comment_learning ?? null}, ${body.comment_strengths ?? null}, ${body.comment_future ?? null}
    )
  `;

  // Notify admin asynchronously — don't block the student's response
  const row = regRows[0];
  sendEvalNotification({
    studentName: `${row.first_name} ${row.last_name}`,
    classTitle:  row.title,
    classDate:   String(row.class_date).slice(0, 10),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
