import {
    VITE_MINIO_ACCESS_KEY,
    VITE_MINIO_SECRET_KEY,
    VITE_MINIO_HOST,
    VITE_MINIO_PORT,
    VITE_MINIO_BUCKET
} from '$env/static/private';
import { Client } from 'minio';

const minioClient = new Client({
    accessKey: VITE_MINIO_ACCESS_KEY,
    secretKey: VITE_MINIO_SECRET_KEY,
    endPoint: VITE_MINIO_HOST,
    port: parseInt(VITE_MINIO_PORT, 10),
    useSSL: false,
});

export async function uploadMinio(file, directory, fileName) {
    if (!file) return false;

    try {
        const objectName = `${directory}/${fileName}`;
        const buffer = Buffer.isBuffer(file) ? file : Buffer.from(await file.arrayBuffer());
        const contentType = Buffer.isBuffer(file) ? 'application/octet-stream' : file.type;

        await minioClient
            .putObject(VITE_MINIO_BUCKET, objectName, buffer, {
                'Content-Type': contentType,
            });

        return objectName;
    } catch (e) {
        throw new Error('Upload file to MinIO failed!');
    }
}

export async function fetchMinio(path) {
    if (!path) return false;

    try {
        const stream = await minioClient
            .getObject(VITE_MINIO_BUCKET, path);
        const stat = await minioClient
            .statObject(VITE_MINIO_BUCKET, path);

        return {
            stream,
            contentType:
                stat.metaData['content-type']
                || 'application/octet-stream',
        };
    } catch (e) {
        throw new Error('Get file from MinIO failed!');
    }
}

export async function deleteMinio(path) {
    if (!path) return false;

    try {
        const result = await minioClient
            .removeObject(VITE_MINIO_BUCKET, path);

        return true;
    } catch (e) {
        throw new Error('Delete file from MinIO failed!');
    }
}
