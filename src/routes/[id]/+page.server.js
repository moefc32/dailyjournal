import { error } from '@sveltejs/kit';
import { Types as mongoTypes } from 'mongoose';
import Journals from '$lib/server/db/model/journals';

export async function load({ params, parent, url }) {
    const pageTitle = '';
    const { userData } = await parent();
    const { id } = params;
    const edit = url.searchParams.has('edit');

    const contents = mongoTypes.ObjectId.isValid(id)
        ? await Journals.findOne({
            _id: id,
            user_id: userData._id,
        }).select('-user_id').lean()
        : null;

    if (!contents) throw error(404, 'Not Found');

    return {
        pageTitle: edit ? 'Edit Journal' : contents.title,
        userData,
        edit_mode: edit,
        contents: {
            ...contents,
            _id: contents._id.toString(),
            uploaded: contents.documentations,
            deleted: [],
            files: [],
            loading: false,
        },
    };
}
