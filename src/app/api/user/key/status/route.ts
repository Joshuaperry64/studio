
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
    // Handle special case for the Creator profile
    if (auth.user.username === 'Joshua') {
      // First, check environment variables (for production deployments)
      let keyExists = !!process.env.GEMINI_API_KEY;

      // If not in env, check .env.local (for local development)
      if (!keyExists) {
        try {
          const envLocalPath = path.resolve(process.cwd(), '.env.local');
          const fileContent = await fs.readFile(envLocalPath, 'utf-8');
          keyExists = fileContent.includes('GEMINI_API_KEY=');
        } catch (error) {
          // .env.local might not exist, which is fine.
          keyExists = false;
        }
      }
      return NextResponse.json({ keyExists });
    }

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
