import { decodeToken } from '$lib/server/token';
import prisma from '$lib/server/prisma';

export async function load({ cookies }) {
    const access_token = cookies.get('access_token');
    const decoded_token = await decodeToken(access_token);
    if (!decoded_token) return;

    const userData = await prisma.users.findUnique({
        where: { id: decoded_token?.id },
    });

    if (userData) delete userData.password;

    return {
        userData,
    };
}
