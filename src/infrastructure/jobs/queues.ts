import { Queue } from "bullmq";
import { bullConnection } from "./bullmqConnection";
import { PushSendJobData } from "./jobTypes";

export const pushQueue = null;
export const paymentsQueue: Queue | null = null;
export const adminQueue: Queue | null = null;

