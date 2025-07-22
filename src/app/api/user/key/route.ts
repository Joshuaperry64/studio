import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

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
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    let userId;
    try {
      const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key') as { userId: number };
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
    }

    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ message: 'API key is required.' }, { status: 400 });
    }

    const user = await db.users.findUnique({ where: { id: userId } });
    if (!user) {
        return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const apiKeyEncrypted = encrypt(apiKey);

    await db.users.update({
        where: { id: userId },
        data: { apiKeyEncrypted },
    });

    return NextResponse.json({ message: 'API key saved successfully.' }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
