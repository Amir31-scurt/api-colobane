"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendExpoPushToUser = sendExpoPushToUser;
exports.sendExpoPush = sendExpoPush;
const axios_1 = __importDefault(require("axios"));
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
async function sendExpoPushToUser(userId, title, body, data) {
    const tokens = await prismaClient_1.prisma.pushToken.findMany({
        where: { userId, isActive: true }
    });
    if (tokens.length === 0)
        return;
    const messages = tokens.map((t) => ({
        to: t.token,
        sound: "default",
        title,
        body,
        data: data ?? {}
    }));
    await axios_1.default.post(EXPO_PUSH_URL, messages, {
        headers: { "Content-Type": "application/json" }
    });
}
async function sendExpoPush(payload) {
    const tokens = await prismaClient_1.prisma.pushToken.findMany({
        where: {
            userId: payload.userId,
            isActive: true
        }
    });
    if (tokens.length === 0)
        return;
    const messages = tokens.map((t) => ({
        to: t.token,
        sound: "default",
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {}
    }));
    try {
        await axios_1.default.post(EXPO_PUSH_URL, messages, {
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
    catch (err) {
        console.error("EXPO_PUSH_ERROR:", err);
    }
}
