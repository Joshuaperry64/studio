
import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { verifyAuth } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { feedback } = await request.json();

    if (!feedback || typeof feedback !== 'string' || feedback.trim().length === 0) {
      return NextResponse.json({ message: 'Feedback cannot be empty.' }, { status: 400 });
    }
    
    const feedbackRef = collection(db, 'feedback');
    await addDoc(feedbackRef, {
      userId: auth.user.userId,
      username: auth.user.username,
      feedback: feedback,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ message: 'Feedback submitted successfully.' }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
