import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await db.users.findUnique({ where: { id: auth.user.userId } });

        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        const { pinHash, apiKeyEncrypted, ...safeUser } = user;
        return NextResponse.json(safeUser, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
