import { VITE_PAGINATION_ITEMS } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

export async function load({ parent }) {
    const { userData } = await parent();

    const [row, total] = await Promise.all([
        prisma.journals.findMany({
            where: { userId: userData.id },
            orderBy: { createdAt: 'desc' },
            skip: 0,
            take: parseInt(VITE_PAGINATION_ITEMS) || 10,
        }),
        prisma.journals.count({
            where: { userId: userData.id },
        }),
    ]);

    return {
        pageTitle: '',
        userData,
        contents: userData ? { row, total } : undefined,
    };
}
