
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth-server';
import { cookies } from 'next/headers';

export async function DELETE(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const deletedUser = await db.users.delete({ where: { id: auth.user.userId } });

        if (!deletedUser) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }
        
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
        if (error.message.includes('Cannot delete administrator account')) {
            return NextResponse.json({ message: 'Administrator accounts cannot be deleted.' }, { status: 403 });
        }
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
