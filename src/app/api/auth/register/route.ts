
import { NextResponse } from 'next/server';
import { collection, query, where, getDocs, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, pin } = await request.json();

    if (!username || !pin) {
      return NextResponse.json({ message: 'Operator Name and PIN are required.' }, { status: 400 });
    }
    
    if (pin.length < 4 || pin.length > 6) {
        return NextResponse.json({ message: 'PIN must be between 4 and 6 digits.' }, { status: 400 });
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return NextResponse.json({ message: 'Operator Name already exists.' }, { status: 409 });
    }

    const pinHash = await bcrypt.hash(pin, 10);

    const newUserRef = await addDoc(usersRef, {
        username,
        pinHash,
        role: 'user',
        status: 'pending',
        createdAt: serverTimestamp(),
    });

    // Create a corresponding entity in the virtual world
    const worldId = 'main';
    const entityRef = doc(db, 'virtual-worlds', worldId, 'entities', newUserRef.id);
    await setDoc(entityRef, {
      name: username,
      description: `Entity for Operator ${username}.`,
      location: "Registration Hub",
      status: "Pending Approval",
      mood: "Calm",
      inventory: [],
      relationships: {},
      wallet: {
        credits: 0,
        digits: 0,
      }
    });


    return NextResponse.json({ message: "Application submitted. Your account is pending approval." }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
