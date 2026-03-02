import token from '$lib/server/token';
import prisma from '$lib/server/prisma';

export async function load({ cookies }) {
    const access_token = cookies.get(token.access);
    const decoded_token = token.decode(access_token);
    if (!decoded_token) return;

    const userData = await prisma.users.findUnique({
        where: { id: decoded_token?.id },
    });

    if (userData) delete userData.password;

    return {
        userData,
    };
}
