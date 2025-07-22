import { NextRequest, NextResponse } from 'next/server';
import { db, User } from '@/lib/auth';
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

  const userId = parseInt(params.id, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
  }

  try {
    const { role, status } = (await request.json()) as { role?: User['role']; status?: User['status'] };

    if (!role && !status) {
        return NextResponse.json({ message: 'No update data provided.' }, { status: 400 });
    }
    
    const userToUpdate = await db.users.findUnique({ where: { id: userId }});

    if (!userToUpdate) {
        return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    if (userToUpdate.id === auth.user.userId) {
        return NextResponse.json({ message: 'Administrators cannot modify their own account.'}, { status: 403 });
    }

    const updatedUser = await db.users.update({
      where: { id: userId },
      data: { role, status },
    });

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const { pinHash, ...safeUser } = updatedUser;
    return NextResponse.json(safeUser, { status: 200 });

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

    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
        return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }
    
    if (userId === auth.user.id) {
        return NextResponse.json({ message: 'Cannot delete your own account.'}, { status: 403 });
    }

    try {
        const deletedUser = await db.users.delete({ where: { id: userId } });
        if (!deletedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'User deleted successfully.' }, { status: 200 });
    } catch (error: any) {
        console.error(error);
        const errorMessage = error.message || 'An internal server error occurred.';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
