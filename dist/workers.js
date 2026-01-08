"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pushWorker_1 = require("./infrastructure/jobs/workers/pushWorker");
const paymentsWorker_1 = require("./infrastructure/jobs/workers/paymentsWorker");
const adminWorker_1 = require("./infrastructure/jobs/workers/adminWorker");
console.log("✅ Workers Colobane démarrés (Redis disabled)");
if (pushWorker_1.pushWorker)
    pushWorker_1.pushWorker.on("failed", (job, err) => console.error("PUSH_JOB_FAILED:", job?.id, err));
if (paymentsWorker_1.paymentsWorker)
    paymentsWorker_1.paymentsWorker.on("failed", (job, err) => console.error("PAYMENT_JOB_FAILED:", job?.id, err));
if (adminWorker_1.adminWorker)
    adminWorker_1.adminWorker.on("failed", (job, err) => console.error("ADMIN_JOB_FAILED:", job?.id, err));
