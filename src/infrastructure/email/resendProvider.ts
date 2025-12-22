import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  await resend.emails.send({
    from: "Colobane <no-reply@mycolobane.com>",
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}
