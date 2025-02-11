import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

export async function PATCH({ url, request }) {
    const id = url.searchParams.get('id');
    const {
        title = '',
        content = '',
    } = await request.json() || {};

    try {
        const data = {};
        if (title) data.title = title;
        if (content) data.content = content;

        const query = await prisma.journals.update({
            where: { id },
            data,
        });

        return json({
            application: VITE_APP_NAME,
            message: 'Update journal success.',
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

export async function DELETE({ url }) {
    const id = url.searchParams.get('id');

    if (!email || !password) {
        return json({
            application: VITE_APP_NAME,
            message: 'Error, id must be given!',
        }, {
            status: 400,
        });
    }

    try {
        const query = await prisma.journals.delete({
            where: { id },
        });

        return json({
            application: VITE_APP_NAME,
            message: 'Delete journal success.',
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
