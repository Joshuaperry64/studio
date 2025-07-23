
import { NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/ai/genkit';

// This is an unprotected route to allow the login page to populate the user dropdown.
export async function GET() {
  try {
    const usersRef = collection(db, 'users');
    // Only fetch users who are approved to show them on the login dropdown
    const q = query(usersRef, where("status", "==", "approved"));
    const querySnapshot = await getDocs(q);

    const usernames = querySnapshot.docs.map(doc => doc.data().username as string);
    
    // Create a Set for efficient duplicate checking and add the special 'Joshua' user.
    const uniqueUsernames = new Set(usernames);
    uniqueUsernames.add('Joshua');

    return NextResponse.json(Array.from(uniqueUsernames), { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    // If the database query itself fails, fallback to a default user to prevent total lockout.
    return NextResponse.json(['Joshua'], { status: 500 });
  }
}
