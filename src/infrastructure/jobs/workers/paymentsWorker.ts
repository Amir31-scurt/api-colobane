import { Worker } from "bullmq";
import { bullConnection } from "../bullmqConnection.ts";
import type { WaveWebhookJobData, OrangeWebhookJobData } from "../jobTypes.ts";
import { handleWaveWebhookUsecase } from "../../../core/usecases/payments/handleWaveWebhookUsecase.ts";
import { handleOrangeMoneyWebhookUsecase } from "../../../core/usecases/payments/handleOrangeMoneyWebhookUsecase.ts";

const concurrency = Number(process.env.JOBS_CONCURRENCY || 5);

export const paymentsWorker = new Worker<WaveWebhookJobData | OrangeWebhookJobData>(
  "paymentsQueue",
  async (job) => {
    if (job.name === "payments:waveWebhook") {
      const event = JSON.parse((job.data as WaveWebhookJobData).rawBody);
      await handleWaveWebhookUsecase({
        providerRef: event.providerRef ?? event.id,
        status: event.status,
        amount: Number(event.amount)
      });
      return;
    }

    if (job.name === "payments:orangeWebhook") {
      const event = JSON.parse((job.data as OrangeWebhookJobData).rawBody);
      await handleOrangeMoneyWebhookUsecase({
        providerRef: event.providerRef ?? event.txnid,
        status: event.status,
        amount: Number(event.amount)
      });
      return;
    }
  },
  { ...bullConnection, concurrency }
);
