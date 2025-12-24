import "dotenv/config";
import { pushWorker } from "./infrastructure/jobs/workers/pushWorker";
import { paymentsWorker } from "./infrastructure/jobs/workers/paymentsWorker";
import { adminWorker } from "./infrastructure/jobs/workers/adminWorker";

console.log("✅ Workers Colobane démarrés (Redis disabled)");

if (pushWorker) pushWorker.on("failed", (job: any, err: any) => console.error("PUSH_JOB_FAILED:", job?.id, err));
if (paymentsWorker) paymentsWorker.on("failed", (job: any, err: any) => console.error("PAYMENT_JOB_FAILED:", job?.id, err));
if (adminWorker) adminWorker.on("failed", (job: any, err: any) => console.error("ADMIN_JOB_FAILED:", job?.id, err));
