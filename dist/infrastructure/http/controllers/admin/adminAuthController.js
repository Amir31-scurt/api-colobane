"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLoginController = adminLoginController;
exports.adminLogoutController = adminLogoutController;
exports.getAdminMeController = getAdminMeController;
const adminLoginUsecase_1 = require("../../../../core/usecases/admin/auth/adminLoginUsecase");
async function adminLoginController(req, res) {
    try {
        const { email, password } = req.body || {};
        if (!email || !password)
            return res.status(400).json({ error: "INVALID_BODY" });
        const result = await (0, adminLoginUsecase_1.adminLoginUsecase)(String(email), String(password));
        return res.json(result);
    }
    catch (e) {
        const code = e?.message || "UNKNOWN";
        const status = code === "INVALID_CREDENTIALS" ? 401 :
            code === "USER_BLOCKED" ? 403 :
                code === "FORBIDDEN" ? 403 : 400;
        return res.status(status).json({ error: code });
    }
}
async function adminLogoutController(req, res) {
    // Client side just drops cookie/token
    return res.json({ success: true });
}
async function getAdminMeController(req, res) {
    try {
        const actor = req.auth;
        if (!actor)
            return res.status(401).json({ error: "UNAUTHORIZED" });
        // Fetch fresh data from DB
        const { prisma } = await Promise.resolve().then(() => __importStar(require("../../../prisma/prismaClient")));
        const user = await prisma.user.findUnique({
            where: { id: actor.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatarUrl: true
            }
        });
        if (!user)
            return res.status(404).json({ error: "USER_NOT_FOUND" });
        return res.json(user);
    }
    catch (error) {
        console.error("Me Error:", error);
        return res.status(401).json({ error: "UNAUTHORIZED" });
    }
}
