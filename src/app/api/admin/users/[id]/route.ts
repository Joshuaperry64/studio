
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { User } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth-server';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const auth = await verifyAuth(request);
  if (!auth.user || auth.user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = params.id;
  if (!userId) {
    return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
  }

  try {
    const { role, status } = (await request.json()) as { role?: User['role']; status?: User['status'] };

    if (!role && !status) {
        return NextResponse.json({ message: 'No update data provided.' }, { status: 400 });
    }
    
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    if (userDoc.id === auth.user.userId) {
        return NextResponse.json({ message: 'Administrators cannot modify their own account.'}, { status: 403 });
    }
    
    await updateDoc(userRef, { role, status });

    const updatedUserDoc = await getDoc(userRef);
    const updatedUserData = updatedUserDoc.data();
    
    const { pinHash, ...safeUser } = updatedUserData as User;
    return NextResponse.json({ id: updatedUserDoc.id, ...safeUser }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
    const auth = await verifyAuth(request);
    if (!auth.user || auth.user.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = params.id;
    if (!userId) {
        return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }
    
    if (userId === auth.user.userId) {
        return NextResponse.json({ message: 'Cannot delete your own account.'}, { status: 403 });
    }

    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        await deleteDoc(userRef);
        return NextResponse.json({ message: 'User deleted successfully.' }, { status: 200 });
    } catch (error: any) {
        console.error(error);
        const errorMessage = error.message || 'An internal server error occurred.';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
