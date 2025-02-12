import { VITE_APP_NAME } from '$env/static/private';
import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { hashPassword } from '$lib/server/hash';
import trimText from '$lib/trimText';

export async function POST({ request }) {
    const {
        name = '',
        email = '',
        password = '',
    } = await request.json() || {};

    if (!name || !email || !password) {
        return json({
            application: VITE_APP_NAME,
            message: 'All data must be filled, please try again!',
        }, {
            status: 400,
        });
    }

    try {
        const query = await prisma.users.create({
            data: {
                name: trimText(name),
                email: email.toLowerCase(),
                password: await hashPassword(password),
            },
        });

        return json({
            application: VITE_APP_NAME,
            message: 'Register new account success.',
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
