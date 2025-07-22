import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth.user || auth.user.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const feedback = await db.feedback.findMany();
        // Sort by most recent
        const sortedFeedback = feedback.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return NextResponse.json(sortedFeedback, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
