import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth-server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function PUT(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { avatarDataUri } = await request.json();

        if (!avatarDataUri) {
            return NextResponse.json({ message: 'Avatar data URI is required.' }, { status: 400 });
        }

        const updatedUser = await db.users.update({
            where: { id: auth.user.userId },
            data: { avatarDataUri },
        });

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }
        
        // Re-issue the auth token with the new avatar URL
        const token = jwt.sign(
            { 
                userId: updatedUser.id, 
                role: updatedUser.role, 
                username: updatedUser.username,
                avatar: updatedUser.avatarDataUri 
            }, 
            process.env.JWT_SECRET || 'your-secret-key', 
            {
                expiresIn: '7d',
            }
        );
        
        const response = NextResponse.json({ message: 'Profile updated successfully' });
        
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });


        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
