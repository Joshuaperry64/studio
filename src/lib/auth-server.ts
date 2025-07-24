
import { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';
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


export function decrypt(hash: string): string | null {
    try {
        const algorithm = 'aes-256-gcm';
        const key = process.env.ENCRYPTION_KEY ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') : undefined;
        if (!key) {
            throw new Error('ENCRYPTION_KEY is not set in environment variables');
        }

        const data = Buffer.from(hash, 'hex');
        const iv = data.subarray(0, 16);
        const tag = data.subarray(16, 32);
        const encrypted = data.subarray(32);
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decipher.setAuthTag(tag);
        return decipher.update(encrypted, undefined, 'utf8') + decipher.final('utf8');
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
}
