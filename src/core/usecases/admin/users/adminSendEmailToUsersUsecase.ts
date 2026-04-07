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

  if (emails.length === 0) {
    return { success: true, recipientsCount: 0, sent: 0, failed: 0 };
  }

  // 3. Actually await the batch so we know if it worked
  const result = await sendEmailBatch(emails, subject, html);

  return {
    success: result.sent > 0,
    recipientsCount: emails.length,
    sent: result.sent,
    failed: result.failed
  };
}
