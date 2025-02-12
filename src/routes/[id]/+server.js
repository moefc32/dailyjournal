import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { deleteMinio } from '$lib/server/minio';
import prisma from '$lib/server/prisma';

export async function PATCH({ params, request }) {
    const { id } = params;
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

export async function DELETE({ params }) {
    const { id } = params;

    if (!id) {
        return json({
            application: VITE_APP_NAME,
            message: 'Error, id must be given!',
        }, {
            status: 400,
        });
    }

    try {
        const files = await prisma.documentations.findMany({
            where: { journalId: id },
            select: { id: true },
        });

        await Promise.all(files.map((file) => deleteMinio(file.id)));

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
