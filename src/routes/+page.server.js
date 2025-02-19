import { VITE_PAGINATION_ITEMS } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { stripUUID } from '$lib/uuid.js';

const PAGINATION_ITEMS =
    parseInt(VITE_PAGINATION_ITEMS, 10) || 10;

export async function load({ parent, url }) {
    const { userData } = await parent();
    const page = parseInt(url.searchParams.get('page'), 10) || 1;
    const limit =
        parseInt(url.searchParams.get('limit'), 10) || PAGINATION_ITEMS;
    const skip = (page - 1) * limit;

    if (!userData) return;

    const [getRow, total] = await Promise.all([
        prisma.journals.findMany({
            where: { userId: userData.id },
            orderBy: { createdAt: 'desc' },
            skip,
            take: PAGINATION_ITEMS,
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
        page,
        contents: userData ? { row, total } : undefined,
    };
}
