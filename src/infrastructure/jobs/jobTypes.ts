export type PushJobName = "push:send";
export type PaymentsJobName = "payments:waveWebhook" | "payments:orangeWebhook";
export type AdminJobName = "admin:dailyAlerts";

export interface PushSendJobData {
  notificationId: number;
}

export interface WaveWebhookJobData {
  rawBody: string;
}

export interface OrangeWebhookJobData {
  rawBody: string;
}

export interface AdminDailyAlertsJobData {
  adminUserId: number;
}
