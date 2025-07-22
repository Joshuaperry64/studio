import { NextResponse } from 'next/server';
import { dbFirestore } from '@/lib/auth';

// This is an unprotected route to allow the login page to populate the user dropdown.
export async function GET() {
  try {
    const usersCollection = dbFirestore.collection('users');
    const users = await usersCollection.get();
    const userList = users.docs.map(doc => doc.data());
    return NextResponse.json(userList);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
