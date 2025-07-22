
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

    const usernames = querySnapshot.docs.map(doc => doc.data().username);
    
    // As a safeguard, ensure the 'Joshua' user can always log in if present in the database,
    // even if the status is somehow not 'approved'. This check is added for robustness.
    const joshuaQuery = query(collection(db, 'users'), where("username", "==", "Joshua"));
    const joshuaSnapshot = await getDocs(joshuaQuery);
    if (!joshuaSnapshot.empty && !usernames.includes('Joshua')) {
        usernames.push('Joshua');
    }

    return NextResponse.json(usernames, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    // Fallback to a default user if there's a DB error to prevent total lockout
    return NextResponse.json({ error: 'Failed to fetch users', fallbackUsers: ['Joshua'] }, { status: 500 });
  }
}
