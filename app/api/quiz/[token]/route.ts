import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { EXAMS } from "@/lib/exam";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(
  _req: NextRequest,
  { params }: Ctx
) {
  const { token } = await params;
  const sql = getDb();

  const rows = await sql`
    SELECT r.id, r.first_name, r.last_name, r.quiz_version,
           c.title, c.class_date,
           qr.id AS result_id, qr.score, qr.passed
    FROM registrations r
    JOIN classes c ON c.id = r.class_id
    LEFT JOIN quiz_results qr ON qr.registration_id = r.id
    WHERE r.quiz_token = ${token}
    LIMIT 1
  `;

  if (!rows[0]) return NextResponse.json({ error: "Invalid link" }, { status: 404 });

  const row = rows[0];
  const version = (row.quiz_version as "C" | "D") ?? "C";
  const exam = EXAMS[version];

  // Strip answers — never send to client
  const questions = exam.questions.map((q, i) => ({
    number: i + 1,
    scenario: q.scenario ?? null,
    text: q.text,
    options: q.options,
  }));

  return NextResponse.json({
    firstName: String(row.first_name),
    lastName: String(row.last_name),
    classTitle: String(row.title),
    classDate: String(row.class_date),
    questions,
    alreadySubmitted: row.result_id != null,
    score: row.score != null ? Number(row.score) : null,
    passed: row.passed != null ? Boolean(row.passed) : null,
  });
}

export async function POST(
  req: NextRequest,
  { params }: Ctx
) {
  const { token } = await params;
  const sql = getDb();

  const rows = await sql`
    SELECT r.id, r.quiz_version, qr.id AS result_id, qr.passed AS prev_passed
    FROM registrations r
    LEFT JOIN quiz_results qr ON qr.registration_id = r.id
    WHERE r.quiz_token = ${token}
    LIMIT 1
  `;

  if (!rows[0]) return NextResponse.json({ error: "Invalid link" }, { status: 404 });

  const { id: regId, result_id, prev_passed } = rows[0];

  // Block re-submission only if they already passed
  if (result_id && prev_passed === true) {
    return NextResponse.json({ error: "Already passed" }, { status: 409 });
  }

  // Delete prior failed attempt so they can retake
  if (result_id) {
    await sql`DELETE FROM quiz_results WHERE registration_id = ${Number(regId)}`;
  }

  const body = await req.json();
  const answers: Record<string, string> = body.answers ?? {};
  const version = (rows[0].quiz_version as "C" | "D") ?? "C";
  const exam = EXAMS[version];

  let correct = 0;
  for (let q = 1; q <= 25; q++) {
    if (answers[String(q)] === exam.answers[q]) correct++;
  }
  const passed = correct >= 21;

  await sql`
    INSERT INTO quiz_results (registration_id, version, answers, score, passed)
    VALUES (${Number(regId)}, ${version}, ${JSON.stringify(answers)}, ${correct}, ${passed})
  `;

  return NextResponse.json({ score: correct, passed, total: 25 });
}
