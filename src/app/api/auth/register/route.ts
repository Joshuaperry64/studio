
import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, pin } = await request.json();

    if (!username || !pin) {
      return NextResponse.json({ message: 'Username and PIN are required.' }, { status: 400 });
    }
    
    if (pin.length < 4 || pin.length > 6) {
        return NextResponse.json({ message: 'PIN must be between 4 and 6 digits.' }, { status: 400 });
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return NextResponse.json({ message: 'Username already exists.' }, { status: 409 });
    }

    const pinHash = await bcrypt.hash(pin, 10);

    await addDoc(usersRef, {
        username,
        pinHash,
        role: 'user',
        status: 'pending',
        createdAt: serverTimestamp(),
    });

    return NextResponse.json({ message: "Application submitted. Your account is pending approval." }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
