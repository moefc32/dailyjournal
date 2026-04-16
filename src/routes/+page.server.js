import { VITE_PAGINATION_ITEMS } from '$env/static/private';
import Journals from '$lib/server/db/model/journals';

const PAGINATION_ITEMS =
    parseInt(VITE_PAGINATION_ITEMS, 10) || 10;

export async function load({ parent, url }) {
    const { userData } = await parent();
    const page = parseInt(url.searchParams.get('page'), 10) || 1;
    const limit =
        parseInt(url.searchParams.get('limit'), 10) || PAGINATION_ITEMS;
    const skip = (page - 1) * limit;

    if (!userData) return;

    const [getRow, total] = await Promise.all([
        Journals.find({ userId: userData._id })
            .select('title createdAt')
            .slice('documentations', 1)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        Journals.countDocuments({ userId: userData._id })
    ]);

    const row = getRow.map(({ _id, documentations, ...item }) => ({
        ...item,
        _id: _id.toString(),
        thumb: documentations[0],
    }));

    return {
        pageTitle: '',
        userData,
        page,
        contents: { row, total },
    };
}
