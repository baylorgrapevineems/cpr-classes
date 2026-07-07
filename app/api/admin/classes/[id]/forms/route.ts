import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/auth";
import { getDb } from "@/lib/db";
import JSZip from "jszip";
import {
  fillCourseRoster,
  fillExamSheet,
  fillCourseEvaluation,
  makeSkillsLabel,
} from "@/lib/pdf-forms";
import type { CPRClass, Registration } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const { id } = await params;
  const classId = parseInt(id);
  const sql = getDb();

  const [classRows, regRows] = await Promise.all([
    sql`SELECT * FROM classes WHERE id = ${classId}`,
    sql`SELECT * FROM registrations WHERE class_id = ${classId} ORDER BY registered_at`,
  ]);

  if (!classRows[0]) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const cls = classRows[0] as CPRClass;
  const regs = regRows as Registration[];

  // Use the request origin so templates are fetched from the same deployment
  const baseUrl = req.nextUrl.origin;

  try {
    const zip = new JSZip();

    // ── Class-level forms ──────────────────────────────────────────────────
    zip.file("BLS-Course-Roster.pdf", await fillCourseRoster(cls, regs, baseUrl));

    // Blank AHA skills checklists (encrypted PDFs — can't be modified)
    const [adultBytes, infantBytes] = await Promise.all([
      fetch(`${baseUrl}/templates/Adult-CPR-and-AED-Skills-Testing-Checklist_ucm_506673.pdf`).then(r => r.arrayBuffer()),
      fetch(`${baseUrl}/templates/Infant-CPR-Skills-Testing-Checklist_ucm_506675.pdf`).then(r => r.arrayBuffer()),
    ]);
    zip.file("Skills-Checklists/Adult-CPR-AED-Skills-Checklist-BLANK.pdf", adultBytes);
    zip.file("Skills-Checklists/Infant-CPR-Skills-Checklist-BLANK.pdf",    infantBytes);

    // ── Per-student forms ──────────────────────────────────────────────────
    const perStudent = zip.folder("Per-Student")!;
    for (const reg of regs) {
      const slug   = `${reg.first_name}_${reg.last_name}`.replace(/[^a-zA-Z0-9_]/g, "_");
      const folder = perStudent.folder(slug)!;
      const [exam, eval_, label] = await Promise.all([
        fillExamSheet(reg, cls, baseUrl),
        fillCourseEvaluation(reg, cls, baseUrl),
        makeSkillsLabel(reg, cls),
      ]);
      folder.file("Exam-Sheet.pdf",        exam);
      folder.file("Course-Evaluation.pdf", eval_);
      folder.file("Skills-Label.pdf",      label);
    }

    const buf      = await zip.generateAsync({ type: "nodebuffer" });
    const filename = `CPR-Class-${cls.class_date.slice(0, 10)}-Forms.zip`;

    return new NextResponse(buf as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
