import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { CPRClass, Registration } from "./types";

// ─── Adult CPR and AED Skills Testing Checklist (built from scratch) ──────────

export async function makeAdultSkillsChecklist(
  reg: Registration,
  cls: CPRClass
): Promise<Uint8Array> {
  const doc    = await PDFDocument.create();
  const font   = await doc.embedFont(StandardFonts.Helvetica);
  const bold   = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const page = doc.addPage([612, 792]);

  const L = 36, R = 576, CW = 540;
  const navy  = rgb(0.13, 0.29, 0.53);
  const lblue = rgb(0.85, 0.91, 0.97);
  const black = rgb(0, 0, 0);
  const gray  = rgb(0.45, 0.45, 0.45);
  const lgray = rgb(0.93, 0.93, 0.93);
  const white = rgb(1, 1, 1);

  const passed = reg.passed;
  const allCb  = passed === true;

  // Draw a 7×7 checkbox; if checked, draw an X inside
  const cb = (x: number, y: number, checked: boolean) => {
    page.drawRectangle({ x, y, width: 7, height: 7, color: white, borderColor: black, borderWidth: 0.75 });
    if (checked) {
      page.drawLine({ start: { x: x+1, y: y+1 }, end: { x: x+6, y: y+6 }, thickness: 1.2, color: black });
      page.drawLine({ start: { x: x+6, y: y+1 }, end: { x: x+1, y: y+6 }, thickness: 1.2, color: black });
    }
  };

  // Blue-bordered section with light-blue header strip at top
  const section = (y: number, h: number) => {
    page.drawRectangle({ x: L, y, width: CW, height: h, color: white });
    page.drawRectangle({ x: L+1, y: y+h-13, width: CW-2, height: 12, color: lblue });
    page.drawRectangle({ x: L, y, width: CW, height: h, borderColor: navy, borderWidth: 1 });
  };

  const t = (s: string, x: number, y: number, size: number, f = font, c = black) =>
    page.drawText(s, { font: f, size, color: c, x, y });

  // ── Title ──────────────────────────────────────────────────────────────────
  t("Basic Life Support", L, 762, 8, font, navy);
  t("Adult CPR and AED", L, 748, 14, bold, navy);
  t("Skills Testing Checklist", L, 732, 14, bold, navy);
  t("American Heart", 472, 752, 7.5, bold, navy);
  t("Association.", 472, 741, 7.5, bold, navy);
  page.drawLine({ start: { x: L, y: 722 }, end: { x: R, y: 722 }, thickness: 0.5, color: navy });

  // ── Student Info ──────────────────────────────────────────────────────────
  t("Student Name", L, 710, 8.5);
  page.drawLine({ start: { x: L+66, y: 709 }, end: { x: 330, y: 709 }, thickness: 0.5, color: black });
  t(`${reg.first_name} ${reg.last_name}`, L+68, 710, 8.5);
  t("Date of Test", 345, 710, 8.5);
  page.drawLine({ start: { x: 345+55, y: 709 }, end: { x: R, y: 709 }, thickness: 0.5, color: black });
  t(fmtDate(cls.class_date), 402, 710, 8.5);

  // ── Scenarios ─────────────────────────────────────────────────────────────
  const sc = 7;
  t('Hospital Scenario: "You are working in a hospital or clinic, and you see a person who has suddenly collapsed in the', L, 698, sc);
  t('hallway. You check that the scene is safe and then approach the patient. Demonstrate what you would do next."', L, 688, sc);
  t('Prehospital Scenario: "You arrive on the scene for a suspected cardiac arrest. No bystander CPR has been provided. You', L, 678, sc);
  t('approach the scene and ensure that it is safe. Demonstrate what you would do next."', L, 668, sc);

  // ── Section 1: Assessment and Activation ─────────────────────────────────
  section(608, 52);
  t("Assessment and Activation", L+4, 648, 8.5, bold, navy);
  cb(L+4, 633, allCb);
  t("Checks responsiveness", L+14, 635, 8);
  cb(L+200, 633, allCb);
  t("Shouts for help/Activates emergency response system/Sends for AED", L+210, 635, 8);
  cb(L+4, 619, allCb);
  t("Checks breathing", L+14, 621, 8);
  cb(L+200, 619, allCb);
  t("Checks pulse", L+210, 621, 8);

  t('Once student shouts for help, instructor says, "Here\'s the barrier device. I am going to get the AED."', L, 598, 7.5, italic, black);

  // ── Section 2: Cycle 1 of CPR ─────────────────────────────────────────────
  section(436, 152);
  t("Cycle 1 of CPR (30:2)   ", L+4, 576, 8.5, bold, navy);
  t("*CPR feedback devices are required for accuracy", L+124, 576, 8, italic, navy);
  t("Adult Compressions", L+6, 562, 8.5, bold, black);
  cb(L+4, 547, allCb);
  t("Performs high-quality compressions*:", L+14, 549, 8);
  t("• Hand placement on lower half of sternum", L+18, 537, 7.5);
  t("• 30 compressions in no less than 15 and no more than 18 seconds", L+18, 526, 7.5);
  t("• Compresses at least 2 inches (5 cm)", L+18, 515, 7.5);
  t("• Complete recoil after each compression", L+18, 504, 7.5);
  t("Adult Breaths", L+6, 490, 8.5, bold, black);
  cb(L+4, 475, allCb);
  t("Gives 2 breaths with a barrier device:", L+14, 477, 8);
  t("• Each breath given over 1 second", L+18, 465, 7.5);
  t("• Visible chest rise with each breath", L+18, 454, 7.5);
  t("• Resumes compressions in less than 10 seconds", L+18, 443, 7.5);

  // ── Section 3: Cycle 2 ────────────────────────────────────────────────────
  section(392, 38);
  t("Cycle 2 of CPR (repeats steps in Cycle 1)   ", L+4, 418, 8.5, bold, navy);
  t("Only check box if step is successfully performed", L+234, 418, 7.5, italic, navy);
  cb(L+4, 403, allCb);
  t("Compressions", L+14, 405, 8);
  cb(L+112, 403, allCb);
  t("Breaths", L+122, 405, 8);
  cb(L+178, 403, allCb);
  t("Resumes compressions in less than 10 seconds", L+188, 405, 8);

  t('Rescuer 2 says, "Here is the AED. I\'ll take over compressions, and you use the AED."', L, 382, 7.5, italic, black);

  // ── Section 4: AED ────────────────────────────────────────────────────────
  section(318, 52);
  t("AED (follows prompts of AED)", L+4, 358, 8.5, bold, navy);
  cb(L+4, 343, allCb);
  t("Powers on AED", L+14, 345, 8);
  cb(L+108, 343, allCb);
  t("Correctly attaches pads", L+118, 345, 8);
  cb(L+266, 343, allCb);
  t("Clears for analysis", L+276, 345, 8);
  cb(L+4, 329, allCb);
  t("Clears to safely deliver a shock", L+14, 331, 8);
  cb(L+196, 329, allCb);
  t("Safely delivers a shock", L+206, 331, 8);

  // ── Section 5: Resumes Compressions ──────────────────────────────────────
  section(256, 52);
  t("Resumes Compressions", L+4, 296, 8.5, bold, navy);
  cb(L+4, 281, allCb);
  t("Ensures compressions are resumed immediately after shock delivery", L+14, 283, 8);
  t("• Student directs instructor to resume compressions  or", L+18, 271, 7.5);
  t("• Second student resumes compressions", L+18, 260, 7.5);

  // ── STOP TEST ─────────────────────────────────────────────────────────────
  page.drawLine({ start: { x: L, y: 250 }, end: { x: R, y: 250 }, thickness: 0.75, color: black });
  t("STOP TEST", 612/2 - 28, 238, 10, bold, black);
  page.drawLine({ start: { x: L, y: 232 }, end: { x: R, y: 232 }, thickness: 0.75, color: black });

  // ── Instructor Notes ──────────────────────────────────────────────────────
  page.drawRectangle({ x: L, y: 158, width: CW, height: 68, color: lgray, borderColor: gray, borderWidth: 0.75 });
  t("Instructor Notes", L+4, 214, 8.5, bold, black);
  t("• Place a check in the box next to each step the student completes successfully.", L+4, 202, 7.5);
  t("• If the student does not complete all steps successfully (as indicated by at least 1 blank check box), the student", L+4, 191, 7.5);
  t("  must receive remediation. Make a note here of which skills require remediation (refer to instructor manual for", L+4, 180, 7.5);
  t("  information about remediation).", L+4, 169, 7.5);

  // ── Test Results ──────────────────────────────────────────────────────────
  page.drawRectangle({ x: L, y: 138, width: CW, height: 18, color: white, borderColor: black, borderWidth: 0.75 });
  t("Test Results", L+4, 143, 8.5, bold, black);
  t("Check PASS or NR to indicate pass or needs remediation:", L+76, 143, 8);
  cb(R-82, 139, passed === true);
  t("PASS", R-72, 143, 8.5, bold, black);
  cb(R-30, 139, passed === false);
  t("NR", R-20, 143, 8.5, bold, black);

  // ── Instructor / Date ─────────────────────────────────────────────────────
  t("Instructor Initials", L, 122, 8);
  page.drawLine({ start: { x: L+80, y: 121 }, end: { x: L+140, y: 121 }, thickness: 0.5, color: black });
  t("Instructor Number", L+150, 122, 8);
  page.drawLine({ start: { x: L+233, y: 121 }, end: { x: L+380, y: 121 }, thickness: 0.5, color: black });
  if (cls.instructor_name) t(cls.instructor_name, L+235, 122, 8);
  t("Date", L+390, 122, 8);
  page.drawLine({ start: { x: L+408, y: 121 }, end: { x: R, y: 121 }, thickness: 0.5, color: black });
  t(fmtDate(cls.class_date), L+410, 122, 8);

  // ── Footer ────────────────────────────────────────────────────────────────
  t("© 2020 American Heart Association", 612/2 - 82, 20, 7, font, gray);

  return doc.save();
}

function toIso(val: unknown): string {
  if (val instanceof Date) return val.toISOString();
  return String(val ?? "");
}

function fmtDate(val: unknown): string {
  const [y, m, day] = toIso(val).slice(0, 10).split("-");
  return `${m}/${day}/${y}`;
}

function fmtTime(val: unknown): string {
  const iso = toIso(val);
  const part = iso.includes("T") ? iso.slice(11, 16) : iso.slice(0, 5);
  const [h, m] = part.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function cardExpiry(val: unknown): string {
  const [y, m, d] = toIso(val).slice(0, 10).split("-");
  return `${m}/${d}/${Number(y) + 2}`;
}

// ─── Course Roster (AcroForm) ─────────────────────────────────────────────────

export async function fillCourseRoster(
  cls: CPRClass,
  regs: Registration[],
  templateBytes: Uint8Array
): Promise<Uint8Array> {
  const doc  = await PDFDocument.load(templateBytes);
  const form = doc.getForm();

  const set = (name: string, val: string) => {
    try { form.getTextField(name).setText(val); } catch {}
  };

  const trainingCenter = process.env.PDF_TRAINING_CENTER ?? "Grapevine Fire Dept";
  const tcId           = process.env.PDF_TRAINING_CENTER_ID ?? "";
  const instructorId   = process.env.PDF_INSTRUCTOR_ID ?? "";

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

  try { form.getCheckBox("Check Box 27").check(); } catch {}

  set("Date 2",                fmtDate(cls.class_date));
  set("Course",                cls.course_type ?? "BLS");
  set("Lead Instructor 2",     cls.instructor_name ?? "");
  set("Lead Instructor ID# 2", instructorId);

  regs.slice(0, 10).forEach((reg, i) => {
    const suffix = i === 0 ? "" : ` ${i + 1}`;
    set(`Name${suffix}`,               `${reg.first_name} ${reg.last_name}`);
    set(`Email${suffix}`,              reg.email);
    set(`Mailing Address${suffix}`,    reg.address ?? "");
    set(`Telephone${suffix}`,          reg.phone ?? "");
    const status =
      reg.passed === true  ? "Complete"   :
      reg.passed === false ? "Incomplete" : "";
    set(`Complete-Incomplete${suffix}`, status);
  });

  form.flatten();
  return doc.save();
}

// ─── Exam Sheet (flat PDF — coordinate overlay) ───────────────────────────────

export async function fillExamSheet(
  reg: Registration,
  cls: CPRClass,
  templateBytes: Uint8Array
): Promise<Uint8Array> {
  const doc  = await PDFDocument.load(templateBytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.getPages()[0];

  const draw = (text: string, x: number, y: number) =>
    page.drawText(text, { font, size: 11, color: rgb(0, 0, 0), x, y });

  draw(`${reg.first_name} ${reg.last_name}`, 120, 706);
  draw(fmtDate(cls.class_date),              392, 706);

  return doc.save();
}

// ─── Course Evaluation (flat PDF — coordinate overlay) ────────────────────────

export async function fillCourseEvaluation(
  reg: Registration,
  cls: CPRClass,
  templateBytes: Uint8Array
): Promise<Uint8Array> {
  const doc  = await PDFDocument.load(templateBytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const page = doc.getPages()[0];

  page.drawText(fmtDate(cls.class_date), {
    font, size: 11, color: rgb(0, 0, 0), x: 52, y: 712,
  });

  return doc.save();
}

// ─── Per-student skills label ─────────────────────────────────────────────────

export async function makeSkillsLabel(
  reg: Registration,
  cls: CPRClass
): Promise<Uint8Array> {
  const doc  = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const page  = doc.addPage([612, 396]);
  const gray  = rgb(0.5, 0.5, 0.5);
  const black = rgb(0, 0, 0);
  const red   = rgb(0.8, 0.1, 0.1);

  page.drawRectangle({ x: 24, y: 24, width: 564, height: 348, borderColor: red, borderWidth: 2 });
  page.drawText("BLS Skills Testing — Student Info", { font: bold, size: 13, color: red, x: 40, y: 344 });
  page.drawLine({ start: { x: 40, y: 336 }, end: { x: 572, y: 336 }, thickness: 1, color: red });

  page.drawText("Student Name:", { font: bold, size: 12, color: gray, x: 40, y: 308 });
  page.drawText(`${reg.first_name} ${reg.last_name}`, { font: bold, size: 20, color: black, x: 40, y: 282 });

  page.drawText("Date of Test:", { font: bold, size: 12, color: gray, x: 40, y: 252 });
  page.drawText(fmtDate(cls.class_date), { font, size: 16, color: black, x: 40, y: 228 });

  page.drawText("Class:", { font: bold, size: 12, color: gray, x: 40, y: 198 });
  page.drawText(`${cls.course_type} — ${cls.location}`, { font, size: 13, color: black, x: 40, y: 176 });

  page.drawText("Email:", { font: bold, size: 12, color: gray, x: 40, y: 148 });
  page.drawText(reg.email, { font, size: 12, color: black, x: 40, y: 128 });

  page.drawLine({ start: { x: 40, y: 80 }, end: { x: 572, y: 80 }, thickness: 0.5, color: gray });
  page.drawText(
    "Print and attach to the AHA Skills Testing Checklist for this student.",
    { font, size: 10, color: gray, x: 40, y: 60 }
  );

  return doc.save();
}
