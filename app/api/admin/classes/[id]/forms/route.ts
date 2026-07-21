import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/auth";
import { getDb } from "@/lib/db";
import JSZip from "jszip";
import {
  fillCourseRoster,
  fillExamSheet,
  fillCourseEvaluation,
  fillQuizResults,
  makeAdultSkillsChecklist,
  makeInfantSkillsChecklist,
} from "@/lib/pdf-forms";
import type { CPRClass, Registration, Evaluation, QuizResult } from "@/lib/types";

export const maxDuration = 60;

async function fetchTemplate(baseUrl: string, filename: string): Promise<Uint8Array> {
  const res = await fetch(`${baseUrl}/templates/${encodeURIComponent(filename)}`);
  if (!res.ok) throw new Error(`Template fetch failed: ${filename} (${res.status})`);
  return new Uint8Array(await res.arrayBuffer());
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const { id } = await params;
  const classId = parseInt(id);
  const sql = getDb();

  try {
    const [classRows, regRows, evalRows, quizRows] = await Promise.all([
      sql`SELECT * FROM classes WHERE id = ${classId}`,
      sql`SELECT * FROM registrations WHERE class_id = ${classId} ORDER BY registered_at`,
      sql`SELECT e.* FROM evaluations e JOIN registrations r ON r.id = e.registration_id WHERE r.class_id = ${classId}`,
      sql`SELECT qr.* FROM quiz_results qr JOIN registrations r ON r.id = qr.registration_id WHERE r.class_id = ${classId}`.catch(() => []),
    ]);

    if (!classRows[0]) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const cls     = classRows[0] as CPRClass;
    const regs    = regRows as Registration[];
    const evals   = evalRows as Evaluation[];
    const quizzes = quizRows as QuizResult[];
    const evalByRegId = Object.fromEntries(evals.map(e => [e.registration_id, e]));
    const quizByRegId = Object.fromEntries(quizzes.map(q => [q.registration_id, q]));
    const base = req.nextUrl.origin;

    // Fetch templates in parallel (skills checklist and eval built from scratch)
    const [rosterBytes, examBytes] =
      await Promise.all([
        fetchTemplate(base, "2025-Guidelines-BLS-Course-Roster.pdf"),
        fetchTemplate(base, "EXAM SHEET.pdf"),
      ]);

    const zip = new JSZip();

    // Course roster (one for the class)
    zip.file("BLS-Course-Roster.pdf", await fillCourseRoster(cls, regs, rosterBytes));

    // Per-student forms (all students in parallel)
    const perStudent = zip.folder("Per-Student")!;
    await Promise.all(regs.map(async (reg) => {
      const slug   = `${reg.first_name}_${reg.last_name}`.replace(/[^a-zA-Z0-9_]/g, "_");
      const folder = perStudent.folder(slug)!;
      const evalData = evalByRegId[reg.id] ?? null;
      const quizData = quizByRegId[reg.id] ?? null;
      const [exam, eval_, adultChecklist, infantChecklist] = await Promise.all([
        fillExamSheet(reg, cls, examBytes),
        fillCourseEvaluation(reg, cls, evalData),
        makeAdultSkillsChecklist(reg, cls),
        makeInfantSkillsChecklist(reg, cls),
      ]);
      folder.file("Exam-Sheet.pdf",                     exam);
      folder.file("Course-Evaluation.pdf",              eval_);
      folder.file("Adult-CPR-AED-Skills-Checklist.pdf", adultChecklist);
      folder.file("Infant-CPR-Skills-Checklist.pdf",    infantChecklist);
      if (quizData?.passed) {
        const quizPdf = await fillQuizResults(reg, cls, {
          version: quizData.version,
          answers: quizData.answers as Record<string, string>,
          score:   Number(quizData.score),
          passed:  Boolean(quizData.passed),
        });
        folder.file("Written-Exam-Results.pdf", quizPdf);
      }
    }));

    const buf      = await zip.generateAsync({ type: "nodebuffer" });
    const dateStr  = (String(cls.class_date)).slice(0, 10).replace("T", "").slice(0, 10);
    const filename = `CPR-Class-${dateStr}-Forms.zip`;

    return new NextResponse(buf as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Forms generation error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
