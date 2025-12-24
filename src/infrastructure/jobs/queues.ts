import { Queue } from "bullmq";
import { bullConnection } from "./bullmqConnection";
import { PushSendJobData } from "./jobTypes";


export const pushQueue = new Queue("pushQueue", { connection: bullConnection });
export const paymentsQueue = new Queue("paymentsQueue", { connection: bullConnection });
export const paymentsReconciliationQueue = new Queue("paymentsReconciliationQueue", { connection: bullConnection });
export const adminQueue = new Queue("adminQueue", { connection: bullConnection });
