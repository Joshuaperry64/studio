
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { verifyAuth } from '@/lib/auth-server';

// In a real application, you would use a more robust encryption method 
// and store the secret key securely (e.g., in environment variables).
// For this example, we'll use a simple XOR cipher for demonstration.
// DO NOT use this in production.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a-very-secret-key-that-is-long-and-secure';

function encrypt(text: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return Buffer.from(result, 'binary').toString('base64');
}


export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ message: 'API key is required.' }, { status: 400 });
    }
    
    const userRef = doc(db, 'users', auth.user.userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const apiKeyEncrypted = encrypt(apiKey);

    await updateDoc(userRef, { apiKeyEncrypted });

    return NextResponse.json({ message: 'API key saved successfully.' }, { status: 200 });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
