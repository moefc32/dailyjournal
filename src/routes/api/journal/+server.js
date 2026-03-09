import {
    VITE_APP_NAME,
    VITE_IMAGE_UPLOAD_LIMIT,
    VITE_PAGINATION_ITEMS,
} from '$env/static/private';
import { json } from '@sveltejs/kit';
import { Types as mongoTypes } from 'mongoose';
import sharp from 'sharp';
import {
    uploadMinio,
    deleteMinio,
} from '$lib/server/minio';
import Journals from '$lib/server/db/model/journals';
import token from '$lib/server/token';
import trimText from '$lib/trimText';

const PAGINATION_ITEMS =
    parseInt(VITE_PAGINATION_ITEMS, 10) || 10;
const MAX_IMAGE_DIMENSION = 1200;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const IMAGE_UPLOAD_LIMIT =
    parseInt(import.meta.env.VITE_IMAGE_UPLOAD_LIMIT, 10) || 10;

export async function GET({ cookies, url }) {
    const search = url.searchParams.get('search')?.trim() || undefined;
    const page = parseInt(url.searchParams.get('page'), 10) || 1;
    const limit =
        parseInt(url.searchParams.get('limit'), 10) || PAGINATION_ITEMS;
    const skip = (page - 1) * limit;

    const access_token = cookies.get(token.access);
    const decoded_token = token.decode(access_token);

    try {
        const [getRow, total] = await Promise.all([
            Journals.find({
                user_id: decoded_token?.id,
                ...(search ? {
                    title: {
                        $regex: search,
                        $options: 'i',
                    }
                } : {})
            })
                .select('title created_at')
                .slice('documentations', 1)
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(PAGINATION_ITEMS)
                .lean(),
            Journals.countDocuments({
                user_id: decoded_token?.id,
                ...(search ? {
                    title: {
                        $regex: search,
                        $options: 'i',
                    }
                } : {})
            }),
        ]);

        const row = getRow.map((item) => ({
            ...item,
            _id: item._id.toString(),
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

    const access_token = cookies.get(token.access);
    const decoded_token = token.decode(access_token);

    if (!title || !content) {
        return json({
            application: VITE_APP_NAME,
            message: 'All data must be filled, please try again!',
        }, {
            status: 400,
        });
    }

    try {
        const documentationIds = files
            .map(() => new mongoTypes.ObjectId().toString());

        await Promise.all(
            files.map(async (file, i) => {
                if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                    throw new Error(`Unsupported file type: ${file.type}`);
                }

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
                    .webp({ quality: 75, effort: 6 })
                    .toBuffer();

                await uploadMinio({
                    buffer: optimizedBuffer,
                    type: 'image/webp',
                    arrayBuffer: async function () {
                        return this.buffer;
                    },
                }, '', documentationIds[i]);
            })
        );

        const query = await Journals.create({
            title,
            content,
            user_id: decoded_token?.id,
            documentations: documentationIds,
        });

        return json({
            application: VITE_APP_NAME,
            message: 'Create new journal success.',
            data: query._id,
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
        data.updated_at = new Date();

        const newFileIds =
            files.map(() => new mongoTypes.ObjectId().toString());

        await Promise.all([
            // Cleanup Minio for deleted files
            ...deleted.map((fileId) => deleteMinio(fileId)),

            // Process and upload new files to Minio
            ...files.map(async (file, i) => {
                if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                    throw new Error(`Unsupported file type: ${file.type}`);
                }

                const fileBuffer = Buffer.from(await file.arrayBuffer());
                const image = sharp(fileBuffer);
                const metadata = await image.metadata();

                let optimizedBuffer = fileBuffer;
                if (metadata.width > MAX_IMAGE_DIMENSION || metadata.height > MAX_IMAGE_DIMENSION) {
                    optimizedBuffer = await image.resize({
                        width: metadata.width > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION : undefined,
                        height: metadata.height > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION : undefined,
                        fit: 'inside',
                    }).toBuffer();
                }

                optimizedBuffer = await sharp(optimizedBuffer)
                    .webp({ quality: 75, effort: 6 })
                    .toBuffer();

                await uploadMinio({
                    buffer: optimizedBuffer,
                    type: 'image/webp',
                    arrayBuffer: async function () { return this.buffer; },
                }, '', newFileIds[i]);
            })
        ]);

        // 2. Combine existing documentations and new IDs into the final array
        data.documentations = [...documentations, ...newFileIds];

        // 3. Perform the update
        const contents = await Journals.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, lean: true }
        );

        return json({
            application: VITE_APP_NAME,
            message: 'Update journal success.',
            data: {
                ...contents,
                _id: contents._id.toString(),
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
        const journal = await Journals.findById(id)
            .select('documentations').lean();

        if (journal && journal.documentations) {
            await Promise.all(journal.documentations.map(
                (fileId) => deleteMinio(fileId))
            );
        }

        await Journals.findByIdAndDelete(id);

        return json({
            application: VITE_APP_NAME,
            message: 'Delete journal success.',
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
