
import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { User } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth-server';
import jwt from 'jsonwebtoken';

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

        const userRef = doc(db, 'users', auth.user.userId);
        await updateDoc(userRef, { avatarDataUri });

        const updatedUserDoc = await getDoc(userRef);
        if (!updatedUserDoc.exists()) {
             return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }
        const updatedUser = { id: updatedUserDoc.id, ...updatedUserDoc.data() } as User;
        
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
        
        const response = NextResponse.json({ message: 'Profile updated successfully', token });
        
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
