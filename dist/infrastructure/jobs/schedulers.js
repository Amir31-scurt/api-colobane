"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchedulers = registerSchedulers;
const queues_1 = require("./queues");
async function registerSchedulers() {
    const cron = process.env.ADMIN_ALERTS_CRON;
    const adminUserId = Number(process.env.ADMIN_ALERTS_ADMIN_USER_ID || 1);
    if (queues_1.adminQueue) {
        await queues_1.adminQueue.add("admin:dailyAlerts", { adminUserId }, {
            repeat: { pattern: cron },
            jobId: `admin:dailyAlerts:${adminUserId}`,
            removeOnComplete: true,
            removeOnFail: false
        });
    }
    if (queues_1.reportQueue) {
        await queues_1.reportQueue.add("report:monthly", {}, {
            repeat: { pattern: "0 0 1 * *" }, // First day of every month at midnight
            jobId: "report:monthly",
            removeOnComplete: true,
        });
    }
}
