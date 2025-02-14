import { VITE_APP_NAME } from '$env/static/private';
import { json, redirect } from '@sveltejs/kit';
import { validateToken } from '$lib/server/token';
import { checkIsUserExists } from '$lib/server/prisma';

export const handle = async ({ event, resolve }) => {
    const { cookies, request, url } = event;
    const currentPath = url.pathname;

    const isTokenValid = validateToken(cookies);
    const isUserExists = isTokenValid
        && (await checkIsUserExists(isTokenValid.id));

    if (!isTokenValid || !isUserExists) {
        cookies.delete('access_token', { path: '/' });
    }

    const isJson = request.headers
        .get('accept')
        ?.includes('application/json');

    const authPaths = ['/login', '/register'];
    if (authPaths.some((path) => currentPath.startsWith(path))) {
        if (!isJson && isTokenValid) throw redirect(303, '/');
    } else {
        if (!isTokenValid) throw redirect(303, '/login');
    }

    return resolve(event);
}
