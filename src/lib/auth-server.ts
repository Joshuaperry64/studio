import { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface UserPayload extends JwtPayload {
    userId: number;
    username: string;
    role: 'admin' | 'user';
}

export async function verifyAuth(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        return { user: null };
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as UserPayload;
        return { user: decoded };
    } catch (error) {
        return { user: null };
    }
}
