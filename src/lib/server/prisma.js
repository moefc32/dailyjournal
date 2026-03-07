import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;

export async function checkIsUserExists(id) {
    if (!id) return false;

    const user = await prisma.users.findUnique({
        where: { id },
        select: { id: true },
    });

    return !!user;
}
