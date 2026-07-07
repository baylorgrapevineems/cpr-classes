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

  const [classRows, regRows] = await Promise.all([
    sql`SELECT * FROM classes WHERE id = ${classId}`,
    sql`SELECT * FROM registrations WHERE class_id = ${classId} ORDER BY registered_at`,
  ]);

  if (!classRows[0]) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const cls  = classRows[0] as CPRClass;
  const regs = regRows as Registration[];

  try {
    const base = req.nextUrl.origin;

    // Fetch all 5 templates in parallel — one round-trip total
    const [rosterBytes, examBytes, evalBytes, adultBytes, infantBytes] =
      await Promise.all([
        fetchTemplate(base, "2020-Guidelines-BLS-Course-Roster_ucm_506772.pdf"),
        fetchTemplate(base, "EXAM SHEET.pdf"),
        fetchTemplate(base, "2020-BLS-Classroom-Course-Evaluation_ucm_506774.pdf"),
        fetchTemplate(base, "Adult-CPR-and-AED-Skills-Testing-Checklist_ucm_506673.pdf"),
        fetchTemplate(base, "Infant-CPR-Skills-Testing-Checklist_ucm_506675.pdf"),
      ]);

    const zip = new JSZip();

    // Course roster (one for the class)
    zip.file("BLS-Course-Roster.pdf", await fillCourseRoster(cls, regs, rosterBytes));

    // Blank AHA skills checklists (encrypted — included as-is)
    zip.file("Skills-Checklists/Adult-CPR-AED-Skills-Checklist-BLANK.pdf", adultBytes);
    zip.file("Skills-Checklists/Infant-CPR-Skills-Checklist-BLANK.pdf",    infantBytes);

    // Per-student forms (all students in parallel)
    const perStudent = zip.folder("Per-Student")!;
    await Promise.all(regs.map(async (reg) => {
      const slug   = `${reg.first_name}_${reg.last_name}`.replace(/[^a-zA-Z0-9_]/g, "_");
      const folder = perStudent.folder(slug)!;
      const [exam, eval_, label] = await Promise.all([
        fillExamSheet(reg, cls, examBytes),
        fillCourseEvaluation(reg, cls, evalBytes),
        makeSkillsLabel(reg, cls),
      ]);
      folder.file("Exam-Sheet.pdf",        exam);
      folder.file("Course-Evaluation.pdf", eval_);
      folder.file("Skills-Label.pdf",      label);
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
