
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { User } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth-server';
import { updateWorldEntity } from '@/ai/flows/world/update-world-entity';
import { setDoc } from 'firebase/firestore';

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
        return NextResponse.json({ message: 'Operator not found.' }, { status: 404 });
    }
    
    const userData = userDoc.data() as User;

    if (userDoc.id === auth.user.userId) {
        return NextResponse.json({ message: 'Licensed Operators cannot modify their own account.'}, { status: 403 });
    }
    
    // Prepare the update payload
    const updateData: { role?: User['role']; status?: User['status'] } = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;


    // If user is being approved and they don't yet exist in the world, create them.
    // Otherwise, update their status.
    const worldId = 'main';
    const entityRef = doc(db, 'virtual-worlds', worldId, 'entities', userId);
    const entityDoc = await getDoc(entityRef);

    if (status === 'approved') {
        if (!entityDoc.exists()) {
             await setDoc(entityRef, {
                name: userData.username,
                description: `Entity for Operator ${userData.username}.`,
                location: "Simulation Core",
                status: "Active",
                mood: "Content",
                inventory: [],
                relationships: {},
            });
        } else {
            await updateDoc(entityRef, { status: 'Active', location: 'Simulation Core' });
        }
    }

    await updateDoc(userRef, updateData);

    const updatedUserDoc = await getDoc(userRef);
    const updatedUserData = updatedUserDoc.data();
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            return NextResponse.json({ message: 'Operator not found' }, { status: 404 });
        }
        await deleteDoc(userRef);
        
        // Also delete the user's entity from the virtual world
        const entityRef = doc(db, 'virtual-worlds', 'main', 'entities', userId);
        const entityDoc = await getDoc(entityRef);
        if (entityDoc.exists()) {
            await deleteDoc(entityRef);
        }
        
        return NextResponse.json({ message: 'Operator deleted successfully.' }, { status: 200 });
    } catch (error: any) {
        console.error(error);
        const errorMessage = error.message || 'An internal server error occurred.';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
