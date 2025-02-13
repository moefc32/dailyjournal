import {
    VITE_APP_NAME,
    VITE_PAGINATION_ITEMS,
} from '$env/static/private';
import { json } from '@sveltejs/kit';
import decodeToken from '$lib/server/token';
import prisma from '$lib/server/prisma';

export async function GET({ cookies, url }) {
    const search = url.searchParams.get('search')?.trim() || undefined;
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit'))
        || (parseInt(VITE_PAGINATION_ITEMS) || 10);
    const skip = (page - 1) * limit;

    const access_token = cookies.get('access_token');
    const decoded_token = decodeToken(access_token);

    try {
        const [row, total] = await Promise.all([
            prisma.journals.findMany({
                where: {
                    userId: decoded_token?.id,
                    ...(search ? { title: { contains: search.toLowerCase() } } : {}),
                },
                orderBy: { createdAt: 'desc' },
                skip: 0,
                take: parseInt(VITE_PAGINATION_ITEMS) || 10,
            }),
            prisma.journals.count({
                where: { userId: decoded_token?.id },
            }),
        ]);

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
