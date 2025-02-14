import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;

export async function checkIsUserExists(userId) {
    if (!userId) return false;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
    });

    return !!user;
}
