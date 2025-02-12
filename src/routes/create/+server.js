import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { decodeToken } from '$lib/server/token';
import { uploadMinio } from '$lib/server/minio';
import prisma from '$lib/server/prisma';
import fs from 'fs';

export async function POST({ cookies, request }) {
    const formData = await request.formData();
    const title = formData.get('title');
    const content = formData.get('content');
    const files = formData.getAll('files[]');
    const uploadedFiles = [];

    const access_token = cookies.get('access_token');
    const decoded_token = await decodeToken(access_token);

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
                userId: decoded_token?.id
            },
            select: { id: true },
        });

        for (const file of files) {
            const newFile = await prisma.documentations.create({
                data: { journalId: query.id },
                select: { id: true },
            });

            await uploadMinio(file, '', newFile.id);
            uploadedFiles.push(newFile.id);
        }

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
