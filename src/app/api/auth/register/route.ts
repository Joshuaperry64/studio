import { NextResponse } from 'next/server';
import { db } from '@/lib/auth';
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

    const existingUser = await db.users.findUnique({ where: { username } });

    if (existingUser) {
      return NextResponse.json({ message: 'Username already exists.' }, { status: 409 });
    }

    const pinHash = await bcrypt.hash(pin, 10);

    const user = await db.users.create({
      data: {
        username,
        pinHash,
      },
    });

    return NextResponse.json({ message: "User registered successfully." }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
