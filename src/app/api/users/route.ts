import { NextResponse } from 'next/server';
import { db } from '@/lib/auth';

// This is an unprotected route to allow the login page to populate the user dropdown.
export async function GET() {
    try {
        const users = await db.users.findMany();
        // Only return usernames for security.
        const usernames = users.map(user => user.username);
        return NextResponse.json(usernames, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch usernames:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
