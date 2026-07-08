import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { EXAMS } from "@/lib/exam";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ token: string }> };

// GET — load student/class info and questions (no answers)
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

  // Strip answers before returning
  const questions = exam.questions.map((q, i) => ({
    number: i + 1,
    scenario: q.scenario ?? null,
    text: q.text,
    options: q.options,
  }));

  return NextResponse.json({
    firstName: row.first_name,
    lastName: row.last_name,
    classTitle: row.title,
    classDate: row.class_date,
    version,
    questions,
    alreadySubmitted: row.result_id != null,
    score: row.score ?? null,
    passed: row.passed ?? null,
  });
}

// POST — submit answers, grade, save result
export async function POST(
  req: NextRequest,
  { params }: Ctx
) {
  const { token } = await params;
  const sql = getDb();

  const rows = await sql`
    SELECT r.id, r.quiz_version, qr.id AS result_id
    FROM registrations r
    LEFT JOIN quiz_results qr ON qr.registration_id = r.id
    WHERE r.quiz_token = ${token}
    LIMIT 1
  `;

  if (!rows[0]) return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  if (rows[0].result_id) return NextResponse.json({ error: "Already submitted" }, { status: 409 });

  const body = await req.json();
  const answers: Record<string, string> = body.answers ?? {};
  const version = (rows[0].quiz_version as "C" | "D") ?? "C";
  const exam = EXAMS[version];
  const regId = rows[0].id as number;

  // Grade
  let correct = 0;
  for (let q = 1; q <= 25; q++) {
    if (answers[String(q)] === exam.answers[q]) correct++;
  }
  const passed = correct >= 21; // 84% of 25

  await sql`
    INSERT INTO quiz_results (registration_id, version, answers, score, passed)
    VALUES (${regId}, ${version}, ${JSON.stringify(answers)}, ${correct}, ${passed})
  `;

  return NextResponse.json({ score: correct, passed, total: 25 });
}
