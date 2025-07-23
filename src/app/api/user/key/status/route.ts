
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { verifyAuth } from '@/lib/auth-server';
import { User } from '@/lib/auth';
import 'dotenv/config'; // Make sure environment variables are loaded
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Standard user logic: check for the encrypted key in the database
    const userRef = doc(db, 'users', auth.user.userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json({ keyExists: false });
    }

    const userData = userDoc.data() as User;
    const keyExists = !!userData.apiKeyEncrypted;

    return NextResponse.json({ keyExists });
  } catch (error) {
    console.error('Error checking API key status:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
