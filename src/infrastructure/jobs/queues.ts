import { Queue } from "bullmq";
import { bullConnection } from "./bullmqConnection";

export const pushQueue: Queue | null = null;
export const paymentsQueue: Queue | null = null;
export const paymentsReconciliationQueue: Queue | null = null;
export const adminQueue: Queue | null = null;
export const reportQueue: Queue | null = null;

