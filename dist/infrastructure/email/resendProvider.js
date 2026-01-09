"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendEmailBatch = sendEmailBatch;
// src/infrastructure/email/resendProvider.ts
const resend_1 = require("resend");
const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM || "Colobane <no-reply@mycolobane.com>";
/**
 * Send an email using Resend
 * If RESEND_API_KEY is not set, logs the email for debugging
 */
async function sendEmail(params) {
    const { to, subject, html, replyTo } = params;
    // Log in development or if no API key
    if (!apiKey || process.env.NODE_ENV === "development") {
        console.log("📧 [Email]", {
            to,
            subject,
            replyTo,
            preview: html.substring(0, 100) + "..."
        });
        if (!apiKey) {
            console.warn("⚠️ RESEND_API_KEY not set - email not sent");
            return false;
        }
    }
    try {
        const resend = new resend_1.Resend(apiKey);
        const result = await resend.emails.send({
            from: fromEmail,
            to,
            subject,
            html,
            replyTo: replyTo,
        });
        if (result.error) {
            console.error("❌ [Resend Error]", result.error);
            return false;
        }
        console.log("✅ [Email Sent]", { to, subject, id: result.data?.id });
        return true;
    }
    catch (error) {
        console.error("❌ [Email Failed]", {
            to,
            subject,
            error: error.message
        });
        return false;
    }
}
/**
 * Send email to multiple recipients
 */
async function sendEmailBatch(recipients, subject, html) {
    for (const to of recipients) {
        await sendEmail({ to, subject, html });
    }
}
