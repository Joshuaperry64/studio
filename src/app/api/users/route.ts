
import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/ai/genkit';

// This is an unprotected route to allow the login page to populate the user dropdown.
export async function GET() {
    try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        // Only return usernames for security.
        const usernames = usersSnapshot.docs.map(doc => doc.data().username);
        return NextResponse.json(usernames, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch usernames:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}

