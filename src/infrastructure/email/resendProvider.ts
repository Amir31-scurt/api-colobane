// src/infrastructure/email/resendProvider.ts
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM || "Colobane <no-reply@mycolobane.com>";

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Send a single email using Resend
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  const { to, subject, html, replyTo } = params;

  if (!apiKey) {
    console.warn("⚠️ RESEND_API_KEY not set - email not sent to", to);
    return false;
  }

  console.log("📧 [Email] Sending to", to, "|", subject);

  try {
    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      replyTo: replyTo,
    });

    if (result.error) {
      console.error("❌ [Resend Error]", result.error);
      return false;
    }

    console.log("✅ [Email Sent]", { to, subject, id: result.data?.id });
    return true;
  } catch (error: any) {
    console.error("❌ [Email Failed]", { to, subject, error: error.message });
    return false;
  }
}

/**
 * Send email to multiple recipients using Resend's batch API
 * Much faster than sending one-by-one
 */
export async function sendEmailBatch(recipients: string[], subject: string, html: string): Promise<{ sent: number; failed: number }> {
  if (!apiKey) {
    console.warn("⚠️ RESEND_API_KEY not set - batch email not sent");
    return { sent: 0, failed: recipients.length };
  }

  if (recipients.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const resend = new Resend(apiKey);

  // Resend batch API supports up to 100 emails per call
  const CHUNK_SIZE = 100;
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < recipients.length; i += CHUNK_SIZE) {
    const chunk = recipients.slice(i, i + CHUNK_SIZE);

    const batch = chunk.map((to) => ({
      from: fromEmail,
      to,
      subject,
      html,
    }));

    try {
      const result = await resend.batch.send(batch);
      if (result.error) {
        console.error("❌ [Resend Batch Error]", result.error);
        failed += chunk.length;
      } else {
        console.log(`✅ [Batch Sent] ${chunk.length} emails (chunk ${Math.floor(i / CHUNK_SIZE) + 1})`);
        sent += chunk.length;
      }
    } catch (error: any) {
      console.error("❌ [Batch Failed]", error.message);
      failed += chunk.length;
    }
  }

  return { sent, failed };
}
