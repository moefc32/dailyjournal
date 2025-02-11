import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import { fetchMinio } from '$lib/server/minio';

export async function GET({ cookies, params }) {
    const { path } = params;

    try {
        const filePath = path.split('.')[0];
        const { stream, contentType } = await fetchMinio(filePath);

        if (!stream) throw new Error();

        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }

        const buffer = Buffer.concat(chunks);

        return new Response(buffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': buffer.length,
                'Cache-Control': `public, max-age=3600`,
            },
        });
    } catch (e) {
        return json({
            application: VITE_APP_NAME,
            message: 'Requested file is not found!',
        }, {
            status: 404,
        });
    }
}
