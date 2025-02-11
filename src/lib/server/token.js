import jwt from 'jsonwebtoken';

export async function validateToken(cookies) {
    if (!cookies) return false;

    const currentToken = cookies.get('access_token');
    const payload = jwt.decode(currentToken);

    if (!payload || payload.exp <= Math.floor(Date.now() / 1000)) return false;

    return true;
}

export async function decodeToken(token) {
    if (!token) return false;

    try {
        const decoded = await jwt.decode(token);
        return decoded;
    } catch (e) {
        console.error(e);
        return false;
    }
}
