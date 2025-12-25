import { prisma } from "../../../infrastructure/prisma/prismaClient";
import bcrypt from "bcryptjs";

export interface UpdateProfileInput {
    userId: number;
    name?: string;
    password?: string;
    avatarUrl?: string;
}

export async function updateProfileUsecase(data: UpdateProfileInput) {
    const { userId, name, password, avatarUrl } = data;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;

    if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
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
