import {
    VITE_APP_NAME,
    VITE_IMAGE_UPLOAD_LIMIT,
} from '$env/static/private';
import { json } from '@sveltejs/kit';
import sharp from 'sharp';
import {
    uploadMinio,
    deleteMinio,
} from '$lib/server/minio';
import prisma from '$lib/server/prisma';
import trimText from '$lib/trimText';

const MAX_IMAGE_DIMENSION = 1200;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const IMAGE_UPLOAD_LIMIT =
    parseInt(import.meta.env.VITE_IMAGE_UPLOAD_LIMIT, 10) || 10;

export async function PATCH({ params, request }) {
    const { id } = params;
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
