import {
    VITE_APP_NAME,
    VITE_PAGINATION_ITEMS,
} from '$env/static/private';
import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

export async function GET({ url }) {
    const search = url.searchParams.get('search')?.trim() || undefined;
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || (VITE_PAGINATION_ITEMS || 10);
    const skip = (page - 1) * limit;

    try {
        const query = await prisma.journals.aggregate({
            _count: { id: true },
            where: search
                ? { title: { contains: search.toLowerCase() } }
                : undefined,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });

        return json({
            application: VITE_APP_NAME,
            message: 'Search data success.',
            data: query,
        });
    } catch (e) {
        console.error(e);

        return json({
            application: VITE_APP_NAME,
            message: e,
        }, {
            status: 500,
        });
    }
}
