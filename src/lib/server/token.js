import { VITE_JWT_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';

export default function decodeToken(token) {
    if (!token) return false;

    const payload = jwt.decode(token);
    return payload || false;
}

export function validateToken(cookies) {
    if (!cookies) return false;

    const token = cookies.get('access_token');
    if (!token) return false;

    try {
        return jwt.verify(token, VITE_JWT_SECRET);
    } catch (e) {
        return false;
    }
}
