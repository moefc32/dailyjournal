import prisma from '$lib/server/prisma';

export async function load({ params, parent }) {
    const pageTitle = '';
    const { userData } = await parent();
    const { id } = params;

    const contents = await prisma.journals.findUnique({
        where: { id },
        include: { documentations: true },
    });

    return {
        pageTitle,
        contents,
    };
}
