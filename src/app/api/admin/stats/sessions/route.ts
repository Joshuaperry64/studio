
import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { verifyAuth } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth.user || auth.user.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const sessionsRef = collection(db, 'copilot-sessions');
        const q = query(sessionsRef, orderBy('createdAt', 'desc'));
        const sessionsSnapshot = await getDocs(q);

        const sessions = sessionsSnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id,
                name: data.name,
                createdBy: data.createdBy,
            };
        });

        return NextResponse.json(sessions, { status: 200 });
    } catch (error) {
        console.error("Error fetching active sessions:", error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}

    
