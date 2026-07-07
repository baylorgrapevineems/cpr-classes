import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { readFileSync } from "fs";
import { join } from "path";
import type { CPRClass, Registration } from "./types";

const TEMPLATES = join(process.cwd(), "public", "templates");
const tpl = (name: string) => join(TEMPLATES, name);

function fmtDate(d: string) {
  const [y, m, day] = d.split("-");
  return `${m}/${day}/${y}`;
}

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function cardExpiry(classDate: string) {
  const [y, m, d] = classDate.split("-");
  return `${m}/${d}/${Number(y) + 2}`;
}

// ─── Course Roster (AcroForm — fill named fields directly) ───────────────────

export async function fillCourseRoster(
  cls: CPRClass,
  regs: Registration[]
): Promise<Uint8Array> {
  const bytes = readFileSync(tpl("2020-Guidelines-BLS-Course-Roster_ucm_506772.pdf"));
  const doc = await PDFDocument.load(bytes);
  const form = doc.getForm();

  const set = (name: string, val: string) => {
    try { form.getTextField(name).setText(val); } catch {}
  };

  const trainingCenter = process.env.PDF_TRAINING_CENTER ?? "Grapevine Fire Dept";
  const tcId           = process.env.PDF_TRAINING_CENTER_ID ?? "";
  const instructorId   = process.env.PDF_INSTRUCTOR_ID ?? "";

  // Page 1 — Course info
  set("Lead Instructor",       cls.instructor_name ?? "");
  set("Lead Instructor ID#",   instructorId);
  set("Card Expriation Date",  cardExpiry(cls.class_date));
  set("Training Center",       trainingCenter);
  set("Training Center ID#",   tcId);
  set("Course Location",       cls.location);
  set("Address",               cls.address ?? "");
  set("Course Start",          `${fmtDate(cls.class_date)} ${fmtTime(cls.start_time)}`);
  set("Course End",            cls.end_time ? `${fmtDate(cls.class_date)} ${fmtTime(cls.end_time)}` : "");
  set("Total Hours",           "4");
  set("Student-Manikin Ratio", "6:1");
  set("Issue Date",            fmtDate(cls.class_date));
  set("Date",                  fmtDate(cls.class_date));

  const passedCount = regs.filter((r) => r.passed === true).length;
  set("No of Cards", String(passedCount > 0 ? passedCount : regs.length));

  // Check "BLS Course" checkbox (Check Box 27)
  try { form.getCheckBox("Check Box 27").check(); } catch {}

  // Page 2 — Student roster
  set("Date 2",              fmtDate(cls.class_date));
  set("Course",              cls.course_type ?? "BLS");
  set("Lead Instructor 2",   cls.instructor_name ?? "");
  set("Lead Instructor ID# 2", instructorId);

  regs.slice(0, 10).forEach((reg, i) => {
    const suffix = i === 0 ? "" : ` ${i + 1}`;
    set(`Name${suffix}`,              `${reg.first_name} ${reg.last_name}`);
    set(`Email${suffix}`,             reg.email);
    set(`Mailing Address${suffix}`,   reg.address ?? "");
    set(`Telephone${suffix}`,         reg.phone ?? "");
    const status =
      reg.passed === true  ? "Complete"   :
      reg.passed === false ? "Incomplete" : "";
    set(`Complete-Incomplete${suffix}`, status);
  });

  form.flatten();
  return doc.save();
}

// ─── Exam Sheet (flat PDF — coordinate overlay) ──────────────────────────────

export async function fillExamSheet(
  reg: Registration,
  cls: CPRClass
): Promise<Uint8Array> {
  const bytes = readFileSync(tpl("EXAM SHEET.pdf"));
  const doc   = await PDFDocument.load(bytes);
  const font  = await doc.embedFont(StandardFonts.Helvetica);
  const page  = doc.getPages()[0];

  const draw = (text: string, x: number, y: number) =>
    page.drawText(text, { font, size: 11, color: rgb(0, 0, 0), x, y });

  draw(`${reg.first_name} ${reg.last_name}`, 120, 706);
  draw(fmtDate(cls.class_date),              392, 706);

  return doc.save();
}

// ─── Course Evaluation (flat PDF — coordinate overlay) ───────────────────────

export async function fillCourseEvaluation(
  reg: Registration,
  cls: CPRClass
): Promise<Uint8Array> {
  const bytes = readFileSync(tpl("2020-BLS-Classroom-Course-Evaluation_ucm_506774.pdf"));
  const doc   = await PDFDocument.load(bytes);
  const font  = await doc.embedFont(StandardFonts.Helvetica);
  const page  = doc.getPages()[0];

  // Only the Date changes per class; Instructor/Training Center/Location are already baked in the template
  page.drawText(fmtDate(cls.class_date), {
    font, size: 11, color: rgb(0, 0, 0), x: 52, y: 712,
  });

  return doc.save();
}

// ─── Skills Checklists (malformed PDFs — embed+overlay approach) ──────────────

// ─── Per-student skills label (used when AHA checklists can't be modified) ───

export async function makeSkillsLabel(
  reg: Registration,
  cls: CPRClass
): Promise<Uint8Array> {
  const doc  = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Half-letter card (612 x 396) — easy to cut and attach to the printed form
  const page = doc.addPage([612, 396]);
  const gray  = rgb(0.5, 0.5, 0.5);
  const black = rgb(0, 0, 0);
  const red   = rgb(0.8, 0.1, 0.1);

  // Border
  page.drawRectangle({ x: 24, y: 24, width: 564, height: 348, borderColor: red, borderWidth: 2 });

  // Header
  page.drawText("BLS Skills Testing — Student Info", { font: bold, size: 13, color: red, x: 40, y: 344 });
  page.drawLine({ start: { x: 40, y: 336 }, end: { x: 572, y: 336 }, thickness: 1, color: red });

  // Student info
  page.drawText("Student Name:", { font: bold, size: 12, color: gray, x: 40, y: 308 });
  page.drawText(`${reg.first_name} ${reg.last_name}`, { font: bold, size: 20, color: black, x: 40, y: 282 });

  page.drawText("Date of Test:", { font: bold, size: 12, color: gray, x: 40, y: 252 });
  page.drawText(fmtDate(cls.class_date), { font, size: 16, color: black, x: 40, y: 228 });

  page.drawText("Class:", { font: bold, size: 12, color: gray, x: 40, y: 198 });
  page.drawText(`${cls.course_type} — ${cls.location}`, { font, size: 13, color: black, x: 40, y: 176 });

  page.drawText("Email:", { font: bold, size: 12, color: gray, x: 40, y: 148 });
  page.drawText(reg.email, { font, size: 12, color: black, x: 40, y: 128 });

  // Footer note
  page.drawLine({ start: { x: 40, y: 80 }, end: { x: 572, y: 80 }, thickness: 0.5, color: gray });
  page.drawText(
    "Print and attach to the AHA Skills Testing Checklist for this student.",
    { font, size: 10, color: gray, x: 40, y: 60 }
  );

  return doc.save();
}
