import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!apiKey) {
    console.warn("⚠️ RESEND_API_KEY is not defined. Email skipped.");
    return;
  }

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: "Colobane <no-reply@mycolobane.com>",
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}
