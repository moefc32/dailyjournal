import prisma from '$lib/server/prisma';

export async function load({ params, parent, url }) {
    const pageTitle = '';
    const { userData } = await parent();
    const { id } = params;
    const edit = url.searchParams.has('edit');

    const contents = await prisma.journals.findUnique({
        where: { id },
        include: {
            documentations: {
                select: { id: true },
                orderBy: { order: 'asc' },
            },
        },
    });

    if (contents?.documentations) {
        contents.documentations =
            contents.documentations.map((item) => item.id);
    }

    return {
        pageTitle,
        userData,
        edit_mode: edit,
        contents: {
            ...contents,
            uploaded: [
                ...contents.documentations,
            ],
            deleted: [],
            files: [],
        },
    };
}
