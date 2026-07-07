import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/auth";
import { getDb } from "@/lib/db";
import JSZip from "jszip";
import { readFileSync } from "fs";
import { join } from "path";
import {
  fillCourseRoster,
  fillExamSheet,
  fillCourseEvaluation,
  makeSkillsLabel,
} from "@/lib/pdf-forms";
import type { CPRClass, Registration } from "@/lib/types";

const TEMPLATES = join(process.cwd(), "public", "templates");

export async function GET(
  _req: NextRequest,
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

  const zip = new JSZip();

  // ── Class-level forms ────────────────────────────────────────────────────
  zip.file("BLS-Course-Roster.pdf", await fillCourseRoster(cls, regs));

  // Include blank AHA skills checklists once (can't be filled due to PDF encryption)
  zip.file(
    "Skills-Checklists/Adult-CPR-AED-Skills-Checklist-BLANK.pdf",
    readFileSync(join(TEMPLATES, "Adult-CPR-and-AED-Skills-Testing-Checklist_ucm_506673.pdf"))
  );
  zip.file(
    "Skills-Checklists/Infant-CPR-Skills-Checklist-BLANK.pdf",
    readFileSync(join(TEMPLATES, "Infant-CPR-Skills-Testing-Checklist_ucm_506675.pdf"))
  );

  // ── Per-student forms ────────────────────────────────────────────────────
  const perStudent = zip.folder("Per-Student");
  for (const reg of regs) {
    const slug = `${reg.first_name}_${reg.last_name}`.replace(/[^a-zA-Z0-9_]/g, "_");
    const folder = perStudent!.folder(slug)!;
    folder.file("Exam-Sheet.pdf",        await fillExamSheet(reg, cls));
    folder.file("Course-Evaluation.pdf", await fillCourseEvaluation(reg, cls));
    folder.file("Skills-Label.pdf",      await makeSkillsLabel(reg, cls));
  }

  const buf = await zip.generateAsync({ type: "nodebuffer" });
  const filename = `CPR-Class-${cls.class_date}-Forms.zip`;

  return new NextResponse(buf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
