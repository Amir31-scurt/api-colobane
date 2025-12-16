import { Queue } from "bullmq";
import { bullConnection } from "./bullmqConnection.ts";

export const pushQueue = new Queue("pushQueue", bullConnection);
export const paymentsQueue = new Queue("paymentsQueue", bullConnection);
export const adminQueue = new Queue("adminQueue", bullConnection);
