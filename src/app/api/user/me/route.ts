
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

    // Handle special case for the Creator profile, which has no DB entry
    if (auth.user.username === 'Joshua') {
      return NextResponse.json(
        {
          id: auth.user.userId,
          username: auth.user.username,
          role: auth.user.role,
          status: 'approved',
          avatarDataUri: auth.user.avatar,
        },
        { status: 200 }
      );
    }

    try {
        const userRef = doc(db, 'users', auth.user.userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        const { pinHash, apiKeyEncrypted, ...safeUser } = userDoc.data() as User;
        return NextResponse.json({ id: userDoc.id, ...safeUser }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
