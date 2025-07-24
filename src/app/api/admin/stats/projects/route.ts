
import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { verifyAuth } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth.user || auth.user.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const projectsRef = collection(db, 'projects');
        const q = query(
            projectsRef, 
            where('isPrivate', '==', false),
            orderBy('updatedAt', 'desc'),
            limit(10) // Limit to the 10 most recently updated public projects
        );
        const projectsSnapshot = await getDocs(q);

        const projects = projectsSnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id,
                name: data.name,
                createdBy: data.createdBy,
            };
        });

        return NextResponse.json(projects, { status: 200 });
    } catch (error) {
        console.error("Error fetching active projects:", error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
