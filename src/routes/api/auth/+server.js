import {
    VITE_APP_NAME,
    VITE_JWT_SECRET,
    VITE_JWT_EXPIRATION,
} from '$env/static/private';
import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import decodeToken from '$lib/server/token';
import prisma from '$lib/server/prisma';
import {
    hashPassword,
    comparePassword,
} from '$lib/server/hash';
import isValidEmail from '$lib/isValidEmail';
import trimText from '$lib/trimText';
import parseMs from '$lib/parseMs';

export async function POST({ cookies, request }) {
    const {
        email = '',
        password = '',
    } = await request.json() || {};

    if (!email || !password) {
        return json({
            application: VITE_APP_NAME,
            message: 'All data must be filled, please try again!',
        }, {
            status: 400,
        });
    }

    if (!isValidEmail(email)) {
        return json({
            application: VITE_APP_NAME,
            message: 'Wrong email or password, please try again!',
        }, {
            status: 400,
        });
    }

    try {
        const lookData = await prisma.users.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (lookData) {
            const passwordMatch = await comparePassword(password, lookData.password);

            if (passwordMatch) {
                const token = await jwt.sign({ id: lookData.id },
                    VITE_JWT_SECRET, { expiresIn: VITE_JWT_EXPIRATION || '1h' });

                const maxAge = parseMs(VITE_JWT_EXPIRATION || '1h');
                cookies.set('access_token', token, {
                    path: '/',
                    httpOnly: true,
                    maxAge,
                });

                return json({
                    application: VITE_APP_NAME,
                    message: 'Login success.',
                });
            }
        }

        return json({
            application: VITE_APP_NAME,
            message: 'Wrong email or password, please try again!',
        }, {
            status: 400,
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

export async function PATCH({ cookies, url, request }) {
    const id = url.searchParams.get('id');
    const {
        name = '',
        email = '',
        password = '',
    } = await request.json() || {};

    const access_token = cookies.get('access_token');
    const decoded_token = decodeToken(access_token);

    try {
        const data = {};
        if (name) data.name = trimText(name);
        if (isValidEmail(email)) data.email = email.toLowerCase();
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

export async function PUT({ request }) {
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

export async function DELETE({ cookies }) {
    try {
        cookies.delete('access_token', { path: '/', });

        return json({
            application: VITE_APP_NAME,
            message: 'Logout success.',
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
