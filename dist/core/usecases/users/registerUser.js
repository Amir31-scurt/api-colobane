"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
// src/core/usecases/users/registerUser
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function registerUser(input) {
    const existing = await prismaClient_1.prisma.user.findUnique({
        where: { email: input.email }
    });
    if (existing) {
        throw new Error("EMAIL_ALREADY_USED");
    }
    const hashed = await bcryptjs_1.default.hash(input.password, 10);
    const user = await prismaClient_1.prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            password: hashed,
            phone: input.phone
        }
    });
    return user;
}
