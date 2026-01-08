"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileUsecase = updateProfileUsecase;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function updateProfileUsecase(data) {
    const { userId, name, password, avatarUrl } = data;
    const updateData = {};
    if (name)
        updateData.name = name;
    if (avatarUrl)
        updateData.avatarUrl = avatarUrl;
    if (password) {
        const salt = await bcryptjs_1.default.genSalt(10);
        updateData.password = await bcryptjs_1.default.hash(password, salt);
    }
    const updatedUser = await prismaClient_1.prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return updatedUser;
}
