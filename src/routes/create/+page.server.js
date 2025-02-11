export async function load({ parent }) {
    const pageTitle = 'Create New Journal';
    const { userData } = await parent();

    return {
        pageTitle,
    };
}
