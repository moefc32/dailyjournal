import prisma from '$lib/server/prisma';

export async function load({ params, parent }) {
    const pageTitle = '';
    const { userData } = await parent();
    const { id } = params;

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
        contents,
    };
}
