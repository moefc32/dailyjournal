import { VITE_APP_NAME } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import { validateToken } from '$lib/server/token';

export const handle = async ({ event, resolve }) => {
    const currentPath = event.url.pathname;
    const cookies = event.cookies;

    const isTokenValid = await validateToken(cookies);

    if (!isTokenValid) {
        cookies.delete('access_token', { path: '/' });
    }

    const authPaths = ['/login', '/register'];
    const isJson = event.request.headers
        .get('accept')
        ?.includes('application/json');

    if (authPaths.some((path) => currentPath.startsWith(path))) {
        if (!isJson && isTokenValid) throw redirect(303, '/');
    } else {
        if (!isTokenValid) throw redirect(303, '/login');
    }

    return await resolve(event);
}
