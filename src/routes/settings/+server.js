import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { hashPassword } from '$lib/server/hash';
import isValidEmail from '$lib/isValidEmail';

export async function PATCH({ url, request }) {
    const id = url.searchParams.get('id');
    const {
        name = '',
        email = '',
        password = '',
    } = await request.json() || {};
    const access_token = cookies.get('access_token');
    const decoded_token = await decodeToken(access_token);

    try {
        const data = {};
        if (name) data.name = name;
        if (email) data.email = email;
        if (password) data.password = await hashPassword(password);

        const query = await prisma.users.update({
            where: { id: decoded_token?.id },
            data,
        });

        return json({
            application: VITE_APP_NAME,
            message: 'Update user account success.',
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
