import { VITE_PAGINATION_ITEMS } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { stripUUID } from '$lib/uuid.js';

export async function load({ parent }) {
    const { userData } = await parent();

    if (!userData) return;

    const [getRow, total] = await Promise.all([
        prisma.journals.findMany({
            where: { userId: userData.id },
            orderBy: { createdAt: 'desc' },
            skip: 0,
            take: parseInt(VITE_PAGINATION_ITEMS, 10) || 10,
            select: {
                id: true,
                title: true,
                createdAt: true,
                documentations: {
                    select: { id: true },
                    orderBy: { order: 'asc' },
                    take: 1,
                },
            },
        }),
        prisma.journals.count({
            where: { userId: userData.id },
        }),
    ]);

    const row = getRow.map(item => ({
        ...item,
        id: stripUUID(item.id),
    }));

    return {
        pageTitle: '',
        userData,
        contents: userData ? { row, total } : undefined,
    };
}
