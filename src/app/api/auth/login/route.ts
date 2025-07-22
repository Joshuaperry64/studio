import { NextResponse } from 'next/server';
import { db } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { username, pin } = await request.json();

    if (!username || !pin) {
      return NextResponse.json({ message: 'Username and PIN are required.' }, { status: 400 });
    }

    const user = await db.users.findUnique({ where: { username } });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    const isPinValid = await bcrypt.compare(pin, user.pinHash);

    if (!isPinValid) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    if (user.status !== 'approved') {
        return NextResponse.json({ message: 'Account not approved. Please contact an administrator.' }, { status: 403 });
    }

    const token = jwt.sign({ userId: user.id, role: user.role, username: user.username }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '7d',
    });
    
    const response = NextResponse.json({ message: 'Login successful.' });
    
    response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    });

    return response;

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
