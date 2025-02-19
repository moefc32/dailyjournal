import prisma from '$lib/server/prisma';
import { parseUUID, stripUUID } from '$lib/uuid.js';

export async function load({ params, parent, url }) {
    const pageTitle = '';
    const { userData } = await parent();
    const { id } = params;
    const edit = url.searchParams.has('edit');

    const contents = await prisma.journals.findUnique({
        where: { id: parseUUID(id) },
        include: {
            documentations: {
                select: { id: true },
                orderBy: { order: 'asc' },
            },
        },
    });

    if (Array.isArray(contents?.documentations)) {
        contents.documentations =
            contents.documentations.map((item) => item.id);
    }

    if (!contents) {
        return {
            pageTitle,
            userData,
        }
    }

    return {
        pageTitle,
        userData,
        edit_mode: edit,
        contents: {
            ...contents,
            id: stripUUID(contents?.id),
            uploaded: contents?.documentations,
            deleted: [],
            files: [],
            loading: false,
        },
    };
}
