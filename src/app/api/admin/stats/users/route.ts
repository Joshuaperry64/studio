
import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where,getCountFromServer } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { verifyAuth } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth.user || auth.user.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const usersRef = collection(db, 'users');
        
        const totalSnapshot = await getCountFromServer(usersRef);
        
        const approvedQuery = query(usersRef, where('status', '==', 'approved'));
        const approvedSnapshot = await getCountFromServer(approvedQuery);

        const pendingQuery = query(usersRef, where('status', '==', 'pending'));
        const pendingSnapshot = await getCountFromServer(pendingQuery);

        return NextResponse.json({
            total: totalSnapshot.data().count,
            approved: approvedSnapshot.data().count,
            pending: pendingSnapshot.data().count,
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching user stats:", error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}

    
