
import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { verifyAuth } from '@/lib/auth-server';
import { User } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth.user || auth.user.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        // Exclude sensitive data like pinHash
        const safeUsers = usersSnapshot.docs.map(doc => {
            const { pinHash, apiKeyEncrypted, ...user } = doc.data() as User;
            return { id: doc.id, ...user };
        });
        return NextResponse.json(safeUsers, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
