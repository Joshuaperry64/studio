
import { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import 'dotenv/config';

interface UserPayload extends JwtPayload {
    userId: string;
    username: string;
    role: 'admin' | 'user';
}

export async function verifyAuth(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
        return { user: null };
    }

    try {
        const jwtSecret = process.env.ENCRYPTION_KEY || 'your-secret-key';
        const decoded = jwt.verify(token, jwtSecret) as UserPayload;
        return { user: decoded };
    } catch (error) {
        console.error("Auth verification error:", error);
        return { user: null };
    }
}
