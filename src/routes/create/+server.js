import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import decodeToken from '$lib/server/token';
import { uploadMinio } from '$lib/server/minio';
import prisma from '$lib/server/prisma';
import sharp from 'sharp';
import trimText from '$lib/trimText';

const MAX_IMAGE_DIMENSION = 1200;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

export async function POST({ cookies, request }) {
    const formData = await request.formData();
    const title = trimText(formData.get('title'));
    const content = trimText(formData.get('content'));
    const files = formData.getAll('files[]');

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

        const uploadedFiles = await Promise.all(
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

                await uploadMinio(optimizedBuffer, '', newFile.id);
                return newFile.id;
            })
        );

        return json({
            application: VITE_APP_NAME,
            message: 'Create new journal success.',
            data: {
                id: query.id,
                uploadedFiles,
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
