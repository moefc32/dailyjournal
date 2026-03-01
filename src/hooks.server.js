import { redirect } from '@sveltejs/kit';
import { validateToken } from '$lib/server/token';
import { checkIsUserExists } from '$lib/server/prisma';

const PUBLIC_ROUTES = [];
const UNAUTH_ROUTES = ['/login', '/register'];
const API_ROUTE = '/api';

function isRouteMatch(routes, path) {
    return routes.some((route) => path.startsWith(route));
}

export const handle = async ({ event, resolve }) => {
    const { cookies, url } = event;
    const currentPath = url.pathname;
    const isTokenValid = validateToken(cookies);

    const lang = cookies.get('lang');
    const validLang = lang && ['en', 'id'].includes(lang);

    if (!validLang) {
        cookies.set('lang', 'en', {
            path: '/',
            httpOnly: true,
        });
    }

    event.locals.lang = validLang ? lang : 'en';

    let user = null;
    let isAuthenticated = false;

    if (isTokenValid) {
        user = await checkIsUserExists(isTokenValid.id);
        isAuthenticated = !!user;
    }

    if (!isAuthenticated) {
        cookies.delete('access_token', { path: '/' });

        if (!user && currentPath.startsWith(API_ROUTE)) {
            return resolve(event);
        }

        if (
            isRouteMatch(PUBLIC_ROUTES, currentPath) ||
            isRouteMatch(UNAUTH_ROUTES, currentPath)
        ) {
            return resolve(event);
        }

        throw redirect(303, '/login');
    }

    if (isRouteMatch(UNAUTH_ROUTES, currentPath)) {
        throw redirect(303, '/');
    }

    return resolve(event);
};
