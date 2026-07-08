import { Resend } from "resend";

const FROM = process.env.FROM_EMAIL ?? "classes@baylorgrapevineems.com";
const ADMIN = process.env.ADMIN_EMAIL ?? "";

export async function sendEvalEmail(opts: {
  to: string;
  firstName: string;
  classTitle: string;
  classDate: string;
  token: string;
  baseUrl: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const link = `${opts.baseUrl}/eval/${opts.token}`;

  await resend.emails.send({
    from: FROM,
    to:   opts.to,
    subject: `Course Evaluation — ${opts.classTitle} (${opts.classDate})`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <h2 style="color:#b91c1c">Baylor Grapevine EMS — Course Evaluation</h2>
        <p>Hi ${opts.firstName},</p>
        <p>Thank you for attending <strong>${opts.classTitle}</strong> on <strong>${opts.classDate}</strong>.</p>
        <p>Please take a moment to complete a short course evaluation. Your feedback helps us improve future classes.</p>
        <p style="margin:24px 0">
          <a href="${link}"
             style="background:#b91c1c;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">
            Complete Evaluation →
          </a>
        </p>
        <p style="color:#666;font-size:13px">Or copy this link: ${link}</p>
        <p style="color:#666;font-size:13px">This link is personal to you and can only be used once.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#999;font-size:12px">Baylor Grapevine EMS · cpr.baylorgrapevine.com</p>
      </div>
    `,
  });
}

export async function sendQuizEmail(opts: {
  to: string;
  firstName: string;
  classTitle: string;
  classDate: string;
  token: string;
  baseUrl: string;
  ref1Base64: string;
  ref2Base64: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const link = `${opts.baseUrl}/quiz/${opts.token}`;

  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `AHA BLS Written Exam — ${opts.classTitle} (${opts.classDate})`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <h2 style="color:#b91c1c">Baylor Grapevine EMS — Written Exam</h2>
        <p>Hi ${opts.firstName},</p>
        <p>Please complete your AHA BLS written exam for <strong>${opts.classTitle}</strong> on <strong>${opts.classDate}</strong>.</p>
        <p>This is an <strong>open-book exam</strong> — two reference documents are attached to this email for you to use.</p>
        <p>The exam is 25 questions. A score of 84% (21 out of 25) or higher is required to pass.</p>
        <p style="margin:24px 0">
          <a href="${link}"
             style="background:#b91c1c;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">
            Start Exam →
          </a>
        </p>
        <p style="color:#666;font-size:13px">Or copy this link: ${link}</p>
        <p style="color:#666;font-size:13px">This link is personal to you and can only be used once.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#999;font-size:12px">Baylor Grapevine EMS · cpr.baylorgrapevineems.com</p>
      </div>
    `,
    attachments: [
      {
        filename: "CPR-Components-Reference.pdf",
        content: opts.ref1Base64,
      },
      {
        filename: "Team-Dynamics-Reference.pdf",
        content: opts.ref2Base64,
      },
    ],
  });
}

export async function sendEvalNotification(opts: {
  studentName: string;
  classTitle: string;
  classDate: string;
}) {
  if (!ADMIN) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: FROM,
    to:   ADMIN,
    subject: `Eval submitted — ${opts.studentName} (${opts.classTitle})`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
        <h3 style="color:#b91c1c;margin-bottom:8px">Course Evaluation Submitted</h3>
        <p><strong>${opts.studentName}</strong> has submitted their evaluation for
           <strong>${opts.classTitle}</strong> on <strong>${opts.classDate}</strong>.</p>
        <p style="color:#555;font-size:13px">Log in to admin to download class forms when all students are done.</p>
      </div>
    `,
  });
}
