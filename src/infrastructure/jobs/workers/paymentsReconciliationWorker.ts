import { Worker } from "bullmq";
import { bullConnection } from "../bullmqConnection";
import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { PaymentProvider } from "@prisma/client";

const RECONCILIATION_INTERVAL_MS = 15 * 60 * 1000; // 15 mins

// This worker will process a recurring job
export const paymentsReconciliationWorker = new Worker(
    "paymentsReconciliationQueue",
    async (job) => {
        console.log("Starting payment reconciliation...");

        // 1. Find payments INITIATED > 15 mins ago
        const cutOffTime = new Date(Date.now() - RECONCILIATION_INTERVAL_MS);

        const stuckPayments = await prisma.payment.findMany({
            where: {
                status: "INITIATED",
                createdAt: {
                    lt: cutOffTime
                }
            }
        });

        console.log(`Found ${stuckPayments.length} stuck payments`);

        for (const payment of stuckPayments) {
            if (payment.provider === "WAVE" || payment.provider === "ORANGE_MONEY") {
                // Here we would ideally call the provider API to check status
                // For now, we assume if no webhook received > 15 mins, it's FAILED or abandoned
                // In a real prod env, we should query provider API before marking FAILED

                await prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: "FAILED" }
                });

                console.log(`Marked payment ${payment.id} as FAILED (reconciliation)`);
            }
        }
    }
);
