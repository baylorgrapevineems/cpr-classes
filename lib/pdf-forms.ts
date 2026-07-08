import { PDFDocument, PDFPage, rgb, StandardFonts } from "pdf-lib";
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

// ─── Infant CPR Skills Testing Checklist (2-page, built from scratch) ─────────

export async function makeInfantSkillsChecklist(
  reg: Registration,
  cls: CPRClass
): Promise<Uint8Array> {
  const doc    = await PDFDocument.create();
  const font   = await doc.embedFont(StandardFonts.Helvetica);
  const bold   = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const L = 36, R = 576, CW = 540;
  const navy  = rgb(0.13, 0.29, 0.53);
  const lblue = rgb(0.85, 0.91, 0.97);
  const black = rgb(0, 0, 0);
  const gray  = rgb(0.45, 0.45, 0.45);
  const lgray = rgb(0.93, 0.93, 0.93);
  const white = rgb(1, 1, 1);

  const passed = reg.passed;
  const allCb  = passed === true;
  const name   = `${reg.first_name} ${reg.last_name}`;
  const date   = fmtDate(cls.class_date);

  // Per-page drawing helpers
  function bind(p: PDFPage) {
    const t = (s: string, x: number, y: number, sz: number, f = font, c = black) =>
      p.drawText(s, { font: f, size: sz, color: c, x, y });
    const cb = (x: number, y: number, checked: boolean) => {
      p.drawRectangle({ x, y, width: 7, height: 7, color: white, borderColor: black, borderWidth: 0.75 });
      if (checked) {
        p.drawLine({ start: { x: x+1, y: y+1 }, end: { x: x+6, y: y+6 }, thickness: 1.2, color: black });
        p.drawLine({ start: { x: x+6, y: y+1 }, end: { x: x+1, y: y+6 }, thickness: 1.2, color: black });
      }
    };
    // White bg + light-blue header strip + navy border
    const section = (y: number, h: number) => {
      p.drawRectangle({ x: L, y, width: CW, height: h, color: white });
      p.drawRectangle({ x: L+1, y: y+h-13, width: CW-2, height: 12, color: lblue });
      p.drawRectangle({ x: L, y, width: CW, height: h, borderColor: navy, borderWidth: 1 });
    };
    // Full light-blue fill + navy border (Cycles 3 & 4)
    const sectionFull = (y: number, h: number) => {
      p.drawRectangle({ x: L, y, width: CW, height: h, color: lblue });
      p.drawRectangle({ x: L, y, width: CW, height: h, borderColor: navy, borderWidth: 1 });
    };
    return { t, cb, section, sectionFull };
  }

  // Shared title + student name block
  function pageHeader(p: PDFPage, label: string) {
    const { t } = bind(p);
    t("Basic Life Support", L, 762, 8, font, navy);
    t("Infant CPR", L, 748, 14, bold, navy);
    t("Skills Testing Checklist ", L, 732, 14, bold, navy);
    t(`(${label})`, L+192, 732, 14, font, navy);
    t("American Heart", 472, 752, 7.5, bold, navy);
    t("Association.", 472, 741, 7.5, bold, navy);
    p.drawLine({ start: { x: L, y: 722 }, end: { x: R, y: 722 }, thickness: 0.5, color: navy });
    t("Student Name", L, 710, 8.5);
    p.drawLine({ start: { x: L+66, y: 709 }, end: { x: 330, y: 709 }, thickness: 0.5, color: black });
    t(name, L+68, 710, 8.5);
    t("Date of Test", 345, 710, 8.5);
    p.drawLine({ start: { x: 345+55, y: 709 }, end: { x: R, y: 709 }, thickness: 0.5, color: black });
    t(date, 402, 710, 8.5);
  }

  // ─── PAGE 1 ───────────────────────────────────────────────────────────────
  const p1 = doc.addPage([612, 792]);
  pageHeader(p1, "1 of 2");
  const { t: t1, cb: cb1, section: sect1, sectionFull: sectF1 } = bind(p1);

  // Scenarios (5 lines at 7pt)
  const sc = 7;
  t1('Hospital Scenario: "You are working in a hospital or clinic when a woman runs through the door, carrying an infant. She', L, 698, sc);
  t1("shouts, 'Help me! My baby's not breathing.' You have gloves and a pocket mask. You send your coworker to activate the", L, 688, sc);
  t1('emergency response system and to get the emergency equipment."', L, 678, sc);
  t1('Prehospital Scenario: "You arrive on the scene for an infant who is not breathing. No bystander CPR has been provided.', L, 668, sc);
  t1('You approach the scene and ensure that it is safe. Demonstrate what you would do next."', L, 658, sc);

  // Assessment and Activation
  sect1(596, 52);
  t1("Assessment and Activation", L+4, 636, 8.5, bold, navy);
  cb1(L+4, 621, allCb);
  t1("Checks responsiveness", L+14, 623, 8);
  cb1(L+200, 621, allCb);
  t1("Shouts for help/Activates emergency response system", L+210, 623, 8);
  cb1(L+4, 607, allCb);
  t1("Checks breathing", L+14, 609, 8);
  cb1(L+200, 607, allCb);
  t1("Checks pulse", L+210, 609, 8);

  t1('Once student shouts for help, instructor says, "Here\'s the barrier device."', L, 586, 7.5, italic, black);

  // Cycle 1 of CPR
  sect1(424, 152);
  t1("Cycle 1 of CPR (30:2)   ", L+4, 564, 8.5, bold, navy);
  t1("*CPR feedback devices are preferred for accuracy", L+124, 564, 8, italic, navy);
  t1("Infant Compressions", L+6, 550, 8.5, bold, black);
  cb1(L+4, 535, allCb);
  t1("Performs high-quality compressions*:", L+14, 537, 8);
  t1("• Placement of 2 fingers or 2 thumbs in the center of the chest, just below the nipple line", L+18, 525, 7.5);
  t1("• 30 compressions in no less than 15 and no more than 18 seconds", L+18, 514, 7.5);
  t1("• Compresses at least one third the depth of the chest, approximately 1½ inches (4 cm)", L+18, 503, 7.5);
  t1("• Complete recoil after each compression", L+18, 492, 7.5);
  t1("Infant Breaths", L+6, 478, 8.5, bold, black);
  cb1(L+4, 463, allCb);
  t1("Gives 2 breaths with a barrier device:", L+14, 465, 8);
  t1("• Each breath given over 1 second", L+18, 453, 7.5);
  t1("• Visible chest rise with each breath", L+18, 442, 7.5);
  t1("• Resumes compressions in less than 10 seconds", L+18, 431, 7.5);

  // Cycle 2 of CPR
  sect1(380, 38);
  t1("Cycle 2 of CPR (repeats steps in Cycle 1)   ", L+4, 406, 8.5, bold, navy);
  t1("Only check box if step is successfully performed", L+234, 406, 7.5, italic, navy);
  cb1(L+4, 391, allCb);
  t1("Compressions", L+14, 393, 8);
  cb1(L+112, 391, allCb);
  t1("Breaths", L+122, 393, 8);
  cb1(L+178, 391, allCb);
  t1("Resumes compressions in less than 10 seconds", L+188, 393, 8);

  t1("Rescuer 2 arrives with bag-mask device and begins ventilation while Rescuer 1 continues compressions with 2 thumb–", L, 370, 7.5, italic, black);
  t1("encircling hands technique.", L, 359, 7.5, italic, black);

  // Cycle 3 of CPR (full blue — 2-rescuer section)
  sectF1(237, 115);
  t1("Cycle 3 of CPR", L+4, 340, 8.5, bold, navy);
  t1("Rescuer 1: Infant Compressions", L+6, 326, 8.5, bold, black);
  cb1(L+4, 311, allCb);
  t1("Performs high-quality compressions*:", L+14, 313, 8);
  t1("• 15 compressions with 2 thumb–encircling hands technique", L+18, 301, 7.5);
  t1("• 15 compressions in no less than 7 and no more than 9 seconds", L+18, 290, 7.5);
  t1("• Compresses at least one third the depth of the chest, approximately 1½ inches (4 cm)", L+18, 279, 7.5);
  t1("• Complete recoil after each compression", L+18, 268, 7.5);
  t1("Rescuer 2: Infant Breaths", L+6, 254, 8.5, bold, black);
  t1("This rescuer is not evaluated.", L+6, 242, 7.5, italic, black);

  t1("(continued)", L, 224, 8, italic, black);
  t1("© 2020 American Heart Association", 612/2 - 82, 20, 7, font, gray);

  // ─── PAGE 2 ───────────────────────────────────────────────────────────────
  const p2 = doc.addPage([612, 792]);
  pageHeader(p2, "2 of 2");
  const { t: t2, cb: cb2, sectionFull: sectF2 } = bind(p2);

  t2("(continued)", L, 696, 8, italic, black);

  // Cycle 4 of CPR (full blue — 2-rescuer section)
  sectF2(574, 106);
  t2("Cycle 4 of CPR", L+4, 668, 8.5, bold, navy);
  t2("Rescuer 2: Infant Compressions", L+6, 654, 8.5, bold, black);
  t2("This rescuer is not evaluated.", L+6, 642, 7.5, italic, black);
  t2("Rescuer 1: Infant Breaths", L+6, 628, 8.5, bold, black);
  cb2(L+4, 613, allCb);
  t2("Gives 2 breaths with a bag-mask device:", L+14, 615, 8);
  t2("• Each breath given over 1 second", L+18, 603, 7.5);
  t2("• Visible chest rise with each breath", L+18, 592, 7.5);
  t2("• Resumes compressions in less than 10 seconds", L+18, 581, 7.5);

  // STOP TEST
  p2.drawLine({ start: { x: L, y: 568 }, end: { x: R, y: 568 }, thickness: 0.75, color: black });
  t2("STOP TEST", 612/2 - 28, 556, 10, bold, black);
  p2.drawLine({ start: { x: L, y: 550 }, end: { x: R, y: 550 }, thickness: 0.75, color: black });

  // Instructor Notes
  p2.drawRectangle({ x: L, y: 476, width: CW, height: 68, color: lgray, borderColor: gray, borderWidth: 0.75 });
  t2("Instructor Notes", L+4, 532, 8.5, bold, black);
  t2("• Place a check in the box next to each step the student completes successfully.", L+4, 520, 7.5);
  t2("• If the student does not complete all steps successfully (as indicated by at least 1 blank check box), the student", L+4, 509, 7.5);
  t2("  must receive remediation. Make a note here of which skills require remediation (refer to instructor manual for", L+4, 498, 7.5);
  t2("  information about remediation).", L+4, 487, 7.5);

  // Test Results
  p2.drawRectangle({ x: L, y: 456, width: CW, height: 18, color: white, borderColor: black, borderWidth: 0.75 });
  t2("Test Results", L+4, 461, 8.5, bold, black);
  t2("Check PASS or NR to indicate pass or needs remediation:", L+76, 461, 8);
  cb2(R-82, 457, passed === true);
  t2("PASS", R-72, 461, 8.5, bold, black);
  cb2(R-30, 457, passed === false);
  t2("NR", R-20, 461, 8.5, bold, black);

  // Instructor / Date
  t2("Instructor Initials", L, 440, 8);
  p2.drawLine({ start: { x: L+80, y: 439 }, end: { x: L+140, y: 439 }, thickness: 0.5, color: black });
  t2("Instructor Number", L+150, 440, 8);
  p2.drawLine({ start: { x: L+233, y: 439 }, end: { x: L+380, y: 439 }, thickness: 0.5, color: black });
  if (cls.instructor_name) t2(cls.instructor_name, L+235, 440, 8);
  t2("Date", L+390, 440, 8);
  p2.drawLine({ start: { x: L+408, y: 439 }, end: { x: R, y: 439 }, thickness: 0.5, color: black });
  t2(date, L+410, 440, 8);

  t2("© 2020 American Heart Association", 612/2 - 82, 20, 7, font, gray);

  return doc.save();
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

// ─── Course Evaluation (built from scratch) ───────────────────────────────────

import type { Evaluation } from "./types";

function wrapText(text: string | null | undefined, maxChars: number): string[] {
  if (!text) return [];
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (test.length > maxChars) { if (line) lines.push(line); line = w; }
    else { line = test; }
  }
  if (line) lines.push(line);
  return lines;
}

export async function fillCourseEvaluation(
  reg: Registration,
  cls: CPRClass,
  eval_: Evaluation | null = null
): Promise<Uint8Array> {
  void reg; // reg not needed; kept for consistent call signature
  const doc  = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([612, 792]);

  const LC = 36;   // left column x
  const RC = 308;  // right column x
  const red   = rgb(0.73, 0.12, 0.12);
  const black = rgb(0, 0, 0);
  const gray  = rgb(0.45, 0.45, 0.45);
  const white = rgb(1, 1, 1);

  const t = (s: string, x: number, y: number, sz: number, f = font, c = black) =>
    page.drawText(s, { font: f, size: sz, color: c, x, y });

  const chk = (x: number, y: number, on: boolean) => {
    page.drawRectangle({ x, y, width: 6, height: 6, color: white, borderColor: black, borderWidth: 0.5 });
    if (on) {
      page.drawLine({ start: { x: x+1, y: y+1 }, end: { x: x+5, y: y+5 }, thickness: 1, color: black });
      page.drawLine({ start: { x: x+5, y: y+1 }, end: { x: x+1, y: y+5 }, thickness: 1, color: black });
    }
  };

  const pick = (field: string, value: string) =>
    eval_ ? (eval_[field as keyof Evaluation] as string | null) === value : false;

  const ch = (label: string, field: string, value: string, x: number, y: number) => {
    chk(x, y, pick(field, value));
    t(label, x + 9, y + 0.5, 8);
  };

  // ── Header ──────────────────────────────────────────────────────────────────
  t("BLS Classroom",     LC,  775, 13, bold, red);
  t("Course Evaluation", LC,  760, 13, bold, red);
  t("American Heart",    446, 770, 7.5, bold, black);
  t("Association.",      446, 759, 7.5, bold, black);
  page.drawLine({ start: { x: LC, y: 748 }, end: { x: 576, y: 748 }, thickness: 2, color: red });

  // Date / Instructor row
  t("Date", LC, 736, 8, bold);
  page.drawLine({ start: { x: LC+25, y: 735 }, end: { x: 200, y: 735 }, thickness: 0.5, color: black });
  t(fmtDate(cls.class_date), LC+27, 736, 8);
  t("Instructor(s)", 210, 736, 8, bold);
  page.drawLine({ start: { x: 258, y: 735 }, end: { x: 576, y: 735 }, thickness: 0.5, color: black });
  t(cls.instructor_name ?? "", 260, 736, 8);

  // Training Center / Location row
  const tc = process.env.PDF_TRAINING_CENTER ?? "Grapevine Fire Dept";
  t("Training Center", LC, 723, 8, bold);
  page.drawLine({ start: { x: LC+74, y: 722 }, end: { x: 200, y: 722 }, thickness: 0.5, color: black });
  t(tc, LC+76, 723, 8);
  t("Location", 210, 723, 8, bold);
  page.drawLine({ start: { x: 244, y: 722 }, end: { x: 576, y: 722 }, thickness: 0.5, color: black });
  t(cls.location, 246, 723, 8);

  // Column divider
  page.drawLine({ start: { x: 300, y: 710 }, end: { x: 300, y: 50 }, thickness: 0.4, color: gray });

  // ── LEFT COLUMN ─────────────────────────────────────────────────────────────
  let ly = 705;

  // Instructor section
  t("Please answer the following questions", LC, ly, 8); ly -= 10;
  t("about your Instructor.", LC, ly, 8, bold); ly -= 12;
  t("My Instructor:", LC, ly, 8); ly -= 13;

  t("1. Provided instruction and help during", LC, ly, 8); ly -= 9;
  t("   my skills practice session", LC, ly, 8); ly -= 11;
  ch("a. Yes", "inst_q1", "yes", LC+6, ly); ly -= 10;
  ch("b. No",  "inst_q1", "no",  LC+6, ly); ly -= 14;

  t("2. Answered all of my questions before", LC, ly, 8); ly -= 9;
  t("   my skills test", LC, ly, 8); ly -= 11;
  ch("a. Yes", "inst_q2", "yes", LC+6, ly); ly -= 10;
  ch("b. No",  "inst_q2", "no",  LC+6, ly); ly -= 14;

  t("3. Was professional and courteous to", LC, ly, 8); ly -= 9;
  t("   the students", LC, ly, 8); ly -= 11;
  ch("a. Yes", "inst_q3", "yes", LC+6, ly); ly -= 10;
  ch("b. No",  "inst_q3", "no",  LC+6, ly); ly -= 16;

  // Course content section
  t("Please answer the following questions", LC, ly, 8); ly -= 10;
  t("about the course content.", LC, ly, 8, bold); ly -= 12;

  t("1. The course learning objectives were", LC, ly, 8); ly -= 9;
  t("   clear.", LC, ly, 8); ly -= 11;
  ch("a. Yes", "content_q1", "yes", LC+6, ly); ly -= 10;
  ch("b. No",  "content_q1", "no",  LC+6, ly); ly -= 13;

  t("2. The overall level of difficulty of", LC, ly, 8); ly -= 9;
  t("   the course was", LC, ly, 8); ly -= 11;
  ch("a. Too hard",    "content_q2", "too_hard",    LC+6, ly); ly -= 10;
  ch("b. Too easy",    "content_q2", "too_easy",    LC+6, ly); ly -= 10;
  ch("c. Appropriate", "content_q2", "appropriate", LC+6, ly); ly -= 13;

  t("3. The content was presented clearly.", LC, ly, 8); ly -= 11;
  ch("a. Yes", "content_q3", "yes", LC+6, ly); ly -= 10;
  ch("b. No",  "content_q3", "no",  LC+6, ly); ly -= 13;

  t("4. The quality of videos and written", LC, ly, 8); ly -= 9;
  t("   materials was", LC, ly, 8); ly -= 11;
  ch("a. Excellent", "content_q4", "excellent", LC+6, ly); ly -= 10;
  ch("b. Good",      "content_q4", "good",      LC+6, ly); ly -= 10;
  ch("c. Fair",      "content_q4", "fair",      LC+6, ly); ly -= 10;
  ch("d. Poor",      "content_q4", "poor",      LC+6, ly); ly -= 13;

  t("5. The equipment was clean and in good", LC, ly, 8); ly -= 9;
  t("   working condition.", LC, ly, 8); ly -= 11;
  ch("a. Yes", "content_q5", "yes", LC+6, ly); ly -= 10;
  ch("b. No",  "content_q5", "no",  LC+6, ly); ly -= 16;

  // Skill mastery Q1-2 (left column)
  t("Please answer the following questions", LC, ly, 8); ly -= 10;
  t("about your skill mastery.", LC, ly, 8, bold); ly -= 12;

  t("1. The course prepared me to", LC, ly, 8); ly -= 9;
  t("   successfully pass the skills session.", LC, ly, 8); ly -= 11;
  ch("a. Yes", "skill_q1", "yes", LC+6, ly); ly -= 10;
  ch("b. No",  "skill_q1", "no",  LC+6, ly); ly -= 13;

  t("2. I am confident I can use the skills", LC, ly, 8); ly -= 9;
  t("   the course taught me.", LC, ly, 8); ly -= 11;
  ch("a. Yes",      "skill_q2", "yes",      LC+6, ly); ly -= 10;
  ch("b. No",       "skill_q2", "no",       LC+6, ly); ly -= 10;
  ch("c. Not sure", "skill_q2", "not_sure", LC+6, ly);

  // ── RIGHT COLUMN ─────────────────────────────────────────────────────────────
  let ry = 705;

  // Skill mastery Q3-4
  t("3. I will respond in an emergency", RC, ry, 8); ry -= 9;
  t("   because of the skills I learned", RC, ry, 8); ry -= 9;
  t("   in this course.", RC, ry, 8); ry -= 11;
  ch("a. Yes",      "skill_q3", "yes",      RC+6, ry); ry -= 10;
  ch("b. No",       "skill_q3", "no",       RC+6, ry); ry -= 10;
  ch("c. Not sure", "skill_q3", "not_sure", RC+6, ry); ry -= 14;

  t("4. I took this course to obtain", RC, ry, 8); ry -= 9;
  t("   professional education credit or", RC, ry, 8); ry -= 9;
  t("   continuing education credit.", RC, ry, 8); ry -= 11;
  ch("a. Yes", "skill_q4", "yes", RC+6, ry); ry -= 10;
  ch("b. No",  "skill_q4", "no",  RC+6, ry); ry -= 18;

  // Optional questions
  t("Optional questions:", RC, ry, 8.5, bold); ry -= 14;

  // Comment 1: comment_learning
  t("Have you previously taken this course via", RC, ry, 7.5); ry -= 9;
  t("another method, such as in a classroom or", RC, ry, 7.5); ry -= 9;
  t("online? Which learning method do you", RC, ry, 7.5); ry -= 9;
  t("prefer and why?", RC, ry, 7.5); ry -= 12;
  {
    const lines = wrapText(eval_?.comment_learning, 46);
    for (let i = 0; i < 4; i++) {
      page.drawLine({ start: { x: RC, y: ry - i*12 }, end: { x: 576, y: ry - i*12 }, thickness: 0.4, color: gray });
      if (lines[i]) t(lines[i], RC+1, ry - i*12 + 2, 7);
    }
    ry -= 4*12 + 10;
  }

  // Comment 2: comment_strengths
  t("Were there any strengths or weaknesses of", RC, ry, 7.5); ry -= 9;
  t("the course that you would like to comment", RC, ry, 7.5); ry -= 9;
  t("on?", RC, ry, 7.5); ry -= 12;
  {
    const lines = wrapText(eval_?.comment_strengths, 46);
    for (let i = 0; i < 4; i++) {
      page.drawLine({ start: { x: RC, y: ry - i*12 }, end: { x: 576, y: ry - i*12 }, thickness: 0.4, color: gray });
      if (lines[i]) t(lines[i], RC+1, ry - i*12 + 2, 7);
    }
    ry -= 4*12 + 10;
  }

  // Comment 3: comment_future
  t("What would you like to see in future", RC, ry, 7.5); ry -= 9;
  t("courses developed by the AHA?", RC, ry, 7.5); ry -= 12;
  {
    const lines = wrapText(eval_?.comment_future, 46);
    for (let i = 0; i < 3; i++) {
      page.drawLine({ start: { x: RC, y: ry - i*12 }, end: { x: 576, y: ry - i*12 }, thickness: 0.4, color: gray });
      if (lines[i]) t(lines[i], RC+1, ry - i*12 + 2, 7);
    }
    ry -= 3*12 + 14;
  }

  // After Completing
  t("After Completing This Evaluation", RC, ry, 8.5, bold); ry -= 12;
  t("Please return this evaluation to your", RC, ry, 7.5); ry -= 9;
  t("Instructor before you leave the class.", RC, ry, 7.5); ry -= 12;
  t("Alternatively, you can send the evaluation", RC, ry, 7.5); ry -= 9;
  t("to your Instructor's Training Center. Ask", RC, ry, 7.5); ry -= 9;
  t("your Instructor for the contact information.", RC, ry, 7.5); ry -= 12;
  t("If you have significant problems or concerns", RC, ry, 7.5); ry -= 9;
  t("with your course, please contact the AHA", RC, ry, 7.5); ry -= 9;
  t("at 877-AHA-4CPR.", RC, ry, 7.5);

  // ── Footer ──────────────────────────────────────────────────────────────────
  page.drawLine({ start: { x: LC, y: 45 }, end: { x: 576, y: 45 }, thickness: 1.5, color: red });
  t("© 2020 American Heart Association", 612/2 - 84, 32, 7, font, gray);

  return doc.save();
}

// ─── Completed Quiz Results PDF ───────────────────────────────────────────────

import { EXAMS } from "./exam";

export async function fillQuizResults(
  reg: Registration,
  cls: CPRClass,
  quizResult: { version: string; answers: Record<string, string>; score: number; passed: boolean }
): Promise<Uint8Array> {
  const exam = EXAMS[(quizResult.version as "C" | "D")] ?? EXAMS["C"];

  const doc    = await PDFDocument.create();
  const font   = await doc.embedFont(StandardFonts.Helvetica);
  const bold   = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const red    = rgb(0.784, 0.063, 0.18);
  const black  = rgb(0, 0, 0);
  const dgray  = rgb(0.35, 0.35, 0.35);
  const lgray  = rgb(0.94, 0.94, 0.94);
  const white  = rgb(1, 1, 1);
  const green  = rgb(0.09, 0.50, 0.24);

  const PW = 612, PH = 792;
  const ML = 40, MR = 572, CW = MR - ML;
  const BOTTOM = 52;

  let page = doc.addPage([PW, PH]);
  let y = PH - 36;

  const t = (text: string, x: number, yy: number, size: number, f = font, c = black) =>
    page.drawText(text, { font: f, size, color: c, x, y: yy, maxWidth: MR - x });

  // Pixel-accurate text wrap
  const wrap = (text: string, maxW: number, size: number, f = font): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (f.widthOfTextAtSize(test, size) > maxW && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  };

  const addPage = (isContinuation: boolean) => {
    page = doc.addPage([PW, PH]);
    y = PH - 36;
    if (isContinuation) {
      page.drawRectangle({ x: ML, y: y - 16, width: CW, height: 20, color: red });
      t("BLS Written Examination — Completed (continued)", ML + 6, y - 11, 8, bold, white);
      y -= 26;
    }
  };

  const ensureSpace = (needed: number) => {
    if (y - needed < BOTTOM) addPage(true);
  };

  // ── Page 1 header ──────────────────────────────────────────────────────────
  page.drawRectangle({ x: ML, y: y - 36, width: CW, height: 40, color: red });
  t("BLS Written Examination — Completed", ML + 8, y - 14, 13, bold, white);
  t("American Heart Association · Basic Life Support", ML + 8, y - 28, 8, font, rgb(1, 0.78, 0.78));
  y -= 46;

  // Student info bar
  page.drawRectangle({ x: ML, y: y - 32, width: CW, height: 36, color: lgray });
  const dateStr = fmtDate(cls.class_date);
  t(`${reg.first_name} ${reg.last_name}`, ML + 8, y - 12, 9, bold);
  t(`Class: ${cls.title}`, ML + 8, y - 26, 8);
  t(`Date: ${dateStr}`, ML + 290, y - 12, 8);
  t(`Exam: Version ${quizResult.version}`, ML + 290, y - 26, 8);
  const scoreColor = quizResult.passed ? green : red;
  t(`${quizResult.score}/25`, MR - 46, y - 12, 13, bold, scoreColor);
  t(quizResult.passed ? "PASSED" : "FAILED", MR - 46, y - 27, 8, bold, scoreColor);
  y -= 42;

  page.drawLine({ start: { x: ML, y }, end: { x: MR, y }, thickness: 0.5, color: dgray });
  y -= 10;

  // ── Questions ──────────────────────────────────────────────────────────────
  let prevScenario: string | null = null;

  for (let i = 0; i < exam.questions.length; i++) {
    const q       = exam.questions[i];
    const qNum    = i + 1;
    const picked  = quizResult.answers[String(qNum)] ?? null;

    // Scenario block — only when scenario changes
    if (q.scenario && q.scenario !== prevScenario) {
      prevScenario = q.scenario;
      const sLines = wrap(q.scenario, CW - 16, 7.5, italic);
      const sH     = sLines.length * 11 + 14;
      ensureSpace(sH + 6);
      page.drawRectangle({ x: ML, y: y - sH, width: CW, height: sH, color: lgray });
      t("SCENARIO", ML + 6, y - 9, 6, bold, dgray);
      for (let l = 0; l < sLines.length; l++) {
        page.drawText(sLines[l], { font: italic, size: 7.5, color: rgb(0.2, 0.2, 0.2), x: ML + 6, y: y - 19 - l * 11 });
      }
      y -= sH + 6;
    }

    // Pre-compute option lines to know total block height
    const LETTERS = ["A", "B", "C", "D"] as const;
    const optRows: { letter: string; lines: string[]; selected: boolean }[] = LETTERS.map((ltr) => ({
      letter: ltr,
      lines:  wrap(`${ltr}.  ${q.options[ltr]}`, CW - 22, 7.5),
      selected: picked === ltr,
    }));
    const qLines  = wrap(`${qNum}.  ${q.text}`, CW - 4, 8, bold);
    const qH      = qLines.length * 12 + 4;
    const optsH   = optRows.reduce((s, o) => s + o.lines.length * 10 + 6, 0);
    const blockH  = qH + optsH + 12;

    ensureSpace(blockH);

    // Question text
    for (let l = 0; l < qLines.length; l++) {
      page.drawText(qLines[l], { font: bold, size: 8, color: black, x: ML, y: y - l * 12 });
    }
    y -= qH + 2;

    // Options
    for (const opt of optRows) {
      const rowH = opt.lines.length * 10 + 6;
      if (opt.selected) {
        page.drawRectangle({ x: ML + 2, y: y - rowH + 2, width: CW - 4, height: rowH, color: rgb(1, 0.94, 0.94), borderColor: red, borderWidth: 0.75 });
      }
      for (let l = 0; l < opt.lines.length; l++) {
        page.drawText(opt.lines[l], {
          font: opt.selected ? bold : font,
          size: 7.5,
          color: opt.selected ? black : dgray,
          x: ML + 10,
          y: y - 3 - l * 10,
        });
      }
      y -= rowH;
    }
    y -= 12;
  }

  // ── Score footer ───────────────────────────────────────────────────────────
  ensureSpace(30);
  page.drawLine({ start: { x: ML, y: y - 4 }, end: { x: MR, y: y - 4 }, thickness: 0.5, color: dgray });
  y -= 18;
  t(
    `Final Score: ${quizResult.score} / 25  (${Math.round((quizResult.score / 25) * 100)}%)  —  ${quizResult.passed ? "PASSED" : "NOT PASSED"}`,
    ML, y, 9, bold, scoreColor
  );

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
