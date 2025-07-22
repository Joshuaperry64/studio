
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

    if (querySnapshot.empty) {
      // Still return an array, but add Joshua by default so he can always log in.
      const creatorExists = await getDocs(query(collection(db, 'users'), where("username", "==", "Joshua")));
      if (creatorExists.empty) {
          // This is a fallback in case the DB is empty.
          return NextResponse.json(['Joshua'], { status: 200 });
      }
       return NextResponse.json([], { status: 200 });
    }

    const usernames = querySnapshot.docs.map(doc => doc.data().username);
    
    // Ensure Joshua is always in the list for login
    if (!usernames.includes('Joshua')) {
        const creatorExists = await getDocs(query(collection(db, 'users'), where("username", "==", "Joshua")));
        if (!creatorExists.empty) {
            usernames.push('Joshua');
        }
    }


    return NextResponse.json(usernames, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    // Fallback to a default user if there's a DB error to prevent total lockout
    return NextResponse.json({ error: 'Failed to fetch users', fallbackUsers: ['Joshua'] }, { status: 500 });
  }
}
