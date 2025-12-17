import "dotenv/config";
import { pushWorker } from "./infrastructure/jobs/workers/pushWorker.ts";
import { paymentsWorker } from "./infrastructure/jobs/workers/paymentsWorker.ts";
import { adminWorker } from "./infrastructure/jobs/workers/adminWorker.ts";

console.log("✅ Workers Colobane démarrés");

pushWorker.on("failed", (job: any, err: any) => console.error("PUSH_JOB_FAILED:", job?.id, err));
paymentsWorker.on("failed", (job: any, err: any) => console.error("PAYMENT_JOB_FAILED:", job?.id, err));
adminWorker.on("failed", (job: any, err: any) => console.error("ADMIN_JOB_FAILED:", job?.id, err));