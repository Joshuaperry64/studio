
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { User } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth-server';
import { cookies } from 'next/headers';

export async function DELETE(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Prevent the creator/admin from deleting their own account
    if (auth.user.role === 'admin') {
        return NextResponse.json({ message: 'Administrator accounts cannot be deleted.' }, { status: 403 });
    }

    try {
        const userRef = doc(db, 'users', auth.user.userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        await deleteDoc(userRef);
        
        const response = NextResponse.json({ message: 'Account deleted successfully' });
        
        // Clear the authentication cookie
        response.cookies.set('auth_token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            maxAge: -1, // Expire the cookie
            path: '/',
        });

        return response;

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
