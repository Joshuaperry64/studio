
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { User } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userRef = doc(db, 'users', auth.user.userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return NextResponse.json({ message: 'Operator not found.' }, { status: 404 });
        }

        const { pinHash, apiKeyEncrypted, ...safeUser } = userDoc.data() as User;
        return NextResponse.json({ id: userDoc.id, ...safeUser }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
