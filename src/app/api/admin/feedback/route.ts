
import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { verifyAuth } from '@/lib/auth-server';
import { Feedback } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth.user || auth.user.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const feedbackRef = collection(db, 'feedback');
        const q = query(feedbackRef, orderBy('createdAt', 'desc'));
        const feedbackSnapshot = await getDocs(q);

        const feedback = feedbackSnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id,
                ...data,
                createdAt: data.createdAt.toDate(), // Convert Firestore Timestamp to JS Date
            } as Feedback;
        });

        return NextResponse.json(feedback, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
