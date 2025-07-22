
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
    
    // As a safeguard, ensure the 'Joshua' user can always log in.
    // Check if Joshua is already in the list from the 'approved' query.
    if (!usernames.includes('Joshua')) {
        const joshuaQuery = query(collection(db, 'users'), where("username", "==", "Joshua"));
        const joshuaSnapshot = await getDocs(joshuaQuery);
        // If Joshua exists in the database but wasn't in the 'approved' list, add him.
        if (!joshuaSnapshot.empty) {
            usernames.push('Joshua');
        }
    }
    
    // If after all checks the list is still empty, add Joshua as a final fallback.
    // This handles the case of a completely empty or new database.
    if (usernames.length === 0) {
        usernames.push('Joshua');
    }

    // Remove duplicates, just in case.
    const uniqueUsernames = [...new Set(usernames)];

    return NextResponse.json(uniqueUsernames, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    // If the database query itself fails, fallback to a default user to prevent total lockout.
    return NextResponse.json(['Joshua'], { status: 500 });
  }
}
