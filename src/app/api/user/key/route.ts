
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { verifyAuth } from '@/lib/auth-server';
import 'dotenv/config';
import crypto from 'crypto';


// In a real application, you would use a more robust encryption method 
// and store the secret key securely (e.g., in environment variables).
const aescipher = (secretKey: crypto.BinaryLike | undefined) => {
    const algorithm = 'aes-256-gcm';
    const key = secretKey;
    if (!key) {
        throw new Error('ENCRYPTION_KEY is not set in environment variables');
    }

    return {
        encrypt: (text: string) => {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(algorithm, key, iv);
            const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
            const tag = cipher.getAuthTag();
            return Buffer.concat([iv, tag, encrypted]).toString('hex');
        },
        decrypt: (hash: string) => {
            const data = Buffer.from(hash, 'hex');
            const iv = data.subarray(0, 16);
            const tag = data.subarray(16, 32);
            const encrypted = data.subarray(32);
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            decipher.setAuthTag(tag);
            return decipher.update(encrypted, undefined, 'utf8') + decipher.final('utf8');
        },
    };
};

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
    
    // Standard user logic (database)
    const userRef = doc(db, 'users', auth.user.userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    const key = process.env.ENCRYPTION_KEY ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') : undefined;
    const { encrypt } = aescipher(key);
    const apiKeyEncrypted = encrypt(apiKey);

    await updateDoc(userRef, { apiKeyEncrypted });

    return NextResponse.json({ message: 'API key saved successfully.' }, { status: 200 });

  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
