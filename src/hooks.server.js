import { VITE_APP_NAME } from '$env/static/private';
import { json, redirect } from '@sveltejs/kit';
import { validateToken } from '$lib/server/token';

export const handle = async ({ event, resolve }) => {
    const currentPath = event.url.pathname;
    const cookies = event.cookies;

    const isTokenValid = await validateToken(cookies);

    if (!isTokenValid) {
        cookies.delete('access_token', { path: '/' });
    }

    const authPaths = ['/login', '/register'];

    if (authPaths.some(path => currentPath.startsWith(path))) {
        if (isTokenValid) {
            throw redirect(303, '/');
        }

        return await resolve(event);
    }

    throw redirect(303, '/login');
}
