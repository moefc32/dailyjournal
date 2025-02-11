import {
    VITE_APP_NAME,
    VITE_JWT_SECRET,
    VITE_JWT_EXPIRATION,
} from '$env/static/private';
import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import jwt from 'jsonwebtoken';
import { comparePassword } from '$lib/server/hash';
import isValidEmail from '$lib/isValidEmail';
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
            where: { email },
        });

        if (!lookData) {
            return json({
                application: VITE_APP_NAME,
                message: 'Wrong email or password, please try again!',
            }, {
                status: 400,
            });
        }

        const passwordMatch = await comparePassword(password, lookData.password);

        if (passwordMatch) {
            const token = await jwt.sign({ id: lookData.id },
                VITE_JWT_SECRET, { expiresIn: JWT_EXPIRATION ?? '1h' });

            const maxAge = parseMs(VITE_JWT_EXPIRATION ?? '1h');
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

        if (!lookData) {
            return json({
                application: VITE_APP_NAME,
                message: 'Wrong email or password, please try again!',
            }, {
                status: 400,
            });
        }
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
