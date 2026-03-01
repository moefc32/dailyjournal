import {
    VITE_APP_NAME,
    VITE_IMAGE_UPLOAD_LIMIT,
    VITE_PAGINATION_ITEMS,
} from '$env/static/private';
import { json } from '@sveltejs/kit';
import sharp from 'sharp';
import {
    uploadMinio,
    deleteMinio,
} from '$lib/server/minio';
import prisma from '$lib/server/prisma';
import decodeToken from '$lib/server/token';
import trimText from '$lib/trimText';

const PAGINATION_ITEMS =
    parseInt(VITE_PAGINATION_ITEMS, 10) || 10;
const MAX_IMAGE_DIMENSION = 1200;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const IMAGE_UPLOAD_LIMIT =
    parseInt(import.meta.env.VITE_IMAGE_UPLOAD_LIMIT, 10) || 10;

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
            id: item.id,
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

export async function POST({ cookies, request }) {
    const formData = await request.formData();
    const title = trimText(formData.get('title'));
    const content = trimText(formData.get('content'));
    const files = formData.getAll('files[]').slice(0, IMAGE_UPLOAD_LIMIT);

    const access_token = cookies.get('access_token');
    const decoded_token = decodeToken(access_token);

    if (!title || !content) {
        return json({
            application: VITE_APP_NAME,
            message: 'All data must be filled, please try again!',
        }, {
            status: 400,
        });
    }

    try {
        const query = await prisma.journals.create({
            data: {
                title,
                content,
                userId: decoded_token?.id,
            },
            select: { id: true },
        });

        await Promise.all(
            files.map(async (file, i) => {
                if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                    throw new Error(`Unsupported file type: ${file.type}`);
                }

                const newFile = await prisma.documentations.create({
                    data: {
                        journalId: query.id,
                        order: i + 1,
                    },
                    select: { id: true },
                });

                const fileBuffer = Buffer.from(await file.arrayBuffer());
                const image = sharp(fileBuffer);
                const metadata = await image.metadata();

                let optimizedBuffer = fileBuffer;
                if (metadata.width > MAX_IMAGE_DIMENSION
                    || metadata.height > MAX_IMAGE_DIMENSION) {
                    optimizedBuffer = await image.resize({
                        width: metadata.width > MAX_IMAGE_DIMENSION
                            ? MAX_IMAGE_DIMENSION
                            : undefined,
                        height: metadata.height > MAX_IMAGE_DIMENSION
                            ? MAX_IMAGE_DIMENSION
                            : undefined,
                        fit: 'inside',
                    }).toBuffer();
                }

                optimizedBuffer = await sharp(optimizedBuffer)
                    .webp({
                        quality: 75,
                        effort: 6,
                    })
                    .toBuffer();

                await uploadMinio({
                    buffer: optimizedBuffer,
                    type: 'image/webp',
                    arrayBuffer: async function () {
                        return this.buffer;
                    },
                }, '', newFile.id);
            })
        );

        return json({
            application: VITE_APP_NAME,
            message: 'Create new journal success.',
            data: query.id,
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

export async function PATCH({ request, url }) {
    const id = url.searchParams.get('id');
    const formData = await request.formData();
    const title = trimText(formData.get('title'));
    const content = trimText(formData.get('content'));
    const documentations = formData.getAll('documentations[]');
    const deleted = formData.getAll('deleted[]');
    const files = formData.getAll('files[]').slice(0, IMAGE_UPLOAD_LIMIT);

    try {
        const data = {};
        if (title) data.title = title;
        if (content) data.content = content;
        data.updatedAt = new Date();

        await prisma.journals.update({
            where: { id },
            data,
        });

        await Promise.all([
            ...documentations.map(async (image, i) => {
                const newFile = await prisma.documentations.update({
                    where: { id: image },
                    data: { order: i + 1 },
                });
            }),
            ...deleted.map(async (image, i) => {
                prisma.documentations.delete({
                    where: { id: image },
                }).then(() => deleteMinio(image))
            }),
            ...files.map(async (file, i) => {
                if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                    throw new Error(`Unsupported file type: ${file.type}`);
                }

                const order = i + 1 + documentations.length;
                const newFile = await prisma.documentations.create({
                    data: {
                        journalId: id,
                        order,
                    },
                    select: { id: true },
                });

                const fileBuffer = Buffer.from(await file.arrayBuffer());
                const image = sharp(fileBuffer);
                const metadata = await image.metadata();

                let optimizedBuffer = fileBuffer;
                if (metadata.width > MAX_IMAGE_DIMENSION
                    || metadata.height > MAX_IMAGE_DIMENSION) {
                    optimizedBuffer = await image.resize({
                        width: metadata.width > MAX_IMAGE_DIMENSION
                            ? MAX_IMAGE_DIMENSION
                            : undefined,
                        height: metadata.height > MAX_IMAGE_DIMENSION
                            ? MAX_IMAGE_DIMENSION
                            : undefined,
                        fit: 'inside',
                    }).toBuffer();
                }

                optimizedBuffer = await sharp(optimizedBuffer)
                    .webp({
                        quality: 75,
                        effort: 6,
                    })
                    .toBuffer();

                await uploadMinio({
                    buffer: optimizedBuffer,
                    type: 'image/webp',
                    arrayBuffer: async function () {
                        return this.buffer;
                    },
                }, '', newFile.id);
                return newFile.id;
            }),
        ]);

        const contents = await prisma.journals.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                content: true,
                updatedAt: true,
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

        return json({
            application: VITE_APP_NAME,
            message: 'Update journal success.',
            data: {
                ...contents,
                uploaded: contents.documentations,
                files: [],
            },
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
