import { VITE_PAGINATION_ITEMS } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

export async function load({ parent }) {
    const { userData } = await parent();

    const contents = await prisma.journals.aggregate({
        _count: { id: true },
        where: { usersId: userData.id },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: VITE_PAGINATION_ITEMS ?? 10,
    });

    return {
        pageTitle: '',
        contents,
    };
}
