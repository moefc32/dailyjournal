import {
    VITE_APP_NAME,
    VITE_PAGINATION_ITEMS,
} from '$env/static/private';
import { json } from '@sveltejs/kit';
import decodeToken from '$lib/server/token';
import prisma from '$lib/server/prisma';
import { stripUUID } from '$lib/uuid.js';

const PAGINATION_ITEMS =
    parseInt(VITE_PAGINATION_ITEMS, 10) || 10;

export async function GET({ cookies, url }) {
    const search = url.searchParams.get('search')?.trim() || undefined;
    const page = parseInt(url.searchParams.get('page'), 10) || 1;
    const limit =
        parseInt(url.searchParams.get('limit'), 10) || PAGINATION_ITEMS;
    const skip = (page - 1) * limit;

    const access_token = cookies.get('access_token');
    const decoded_token = decodeToken(access_token);

    try {
        const [getRow, total] = await Promise.all([
            prisma.journals.findMany({
                where: {
                    userId: decoded_token?.id,
                    ...(search
                        ? { title: { contains: search.toLowerCase() } }
                        : {}
                    ),
                },
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
                where: { userId: decoded_token?.id },
            }),
        ]);

        const row = getRow.map(item => ({
            ...item,
            id: stripUUID(item.id),
        }));

        return json({
            application: VITE_APP_NAME,
            message: 'Search data success.',
            data: { row, total },
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
