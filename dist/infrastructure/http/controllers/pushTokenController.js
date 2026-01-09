"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPushTokenController = registerPushTokenController;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
async function registerPushTokenController(req, res) {
    const { token, platform } = req.body;
    if (!token || !platform) {
        return res.status(400).json({
            message: "token et platform requis"
        });
    }
    await prismaClient_1.prisma.pushToken.upsert({
        where: { token },
        update: {
            isActive: true
        },
        create: {
            userId: req.user.id,
            token,
            platform
        }
    });
    return res.json({ message: "Push token enregistré" });
}
