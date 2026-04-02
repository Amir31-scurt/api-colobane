import { prisma } from "../../../../infrastructure/prisma/prismaClient";
import { sendEmailBatch } from "../../../../infrastructure/email/resendProvider";

interface AdminSendEmailInput {
  actorId: number;
  subject: string;
  html: string;
}

export async function adminSendEmailToUsersUsecase({ actorId, subject, html }: AdminSendEmailInput) {
  // 1. Verify actor is ADMIN
  const actor = await prisma.user.findUnique({ where: { id: actorId } });
  if (!actor || actor.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  // 2. Fetch all users who have an email
  // Assuming 'CUSTOMER' or all registered users
  const users = await prisma.user.findMany({
    where: {
      email: { not: null }
    },
    select: { email: true }
  });

  const emails = users.map(u => u.email).filter(Boolean) as string[];

  // 3. Batch send (in background or await chunks if large)
  // Send Email Batch supports arrays
  if (emails.length > 0) {
    // Fire and forget so we don't block the request if there are thousands
    sendEmailBatch(emails, subject, html).catch((err) => {
      console.error("Failed to send batch emails:", err);
    });
  }

  return {
    success: true,
    recipientsCount: emails.length
  };
}
