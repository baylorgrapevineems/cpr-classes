import { Resend } from "resend";

const FROM = process.env.FROM_EMAIL ?? "classes@baylorgrapevineems.com";

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
    to: opts.to,
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
        <p style="color:#999;font-size:12px">Baylor Grapevine EMS · baylorgrapevineems.com</p>
      </div>
    `,
  });
}
