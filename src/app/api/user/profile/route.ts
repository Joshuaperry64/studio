
import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { User } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth-server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

export async function PUT(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { avatarDataUri, username, pin } = await request.json();

        if (!avatarDataUri && !username && !pin) {
            return NextResponse.json({ message: 'No profile data provided to update.' }, { status: 400 });
        }
        
        const updateData: Partial<User> = {};

        // Handle username change
        if (username) {
            if (username !== auth.user.username) {
                // Check if new username is already taken
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where("username", "==", username));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    return NextResponse.json({ message: 'Operator name is already taken.' }, { status: 409 });
                }
            }
            updateData.username = username;
        }

        // Handle PIN change
        if (pin) {
             if (pin.length < 4 || pin.length > 6) {
                return NextResponse.json({ message: 'PIN must be between 4 and 6 digits.' }, { status: 400 });
            }
            updateData.pinHash = await bcrypt.hash(pin, 10);
        }
        
        // Handle avatar change
        if (avatarDataUri) {
            updateData.avatarDataUri = avatarDataUri;
        }

        const userRef = doc(db, 'users', auth.user.userId);
        await updateDoc(userRef, updateData);

        const updatedUserDoc = await getDoc(userRef);
        if (!updatedUserDoc.exists()) {
             return NextResponse.json({ message: 'Operator not found.' }, { status: 404 });
        }
        const updatedUser = { id: updatedUserDoc.id, ...updatedUserDoc.data() } as User;
        
        const jwtSecret = process.env.ENCRYPTION_KEY || 'your-secret-key';
        // Re-issue the auth token with the new user info
        const token = jwt.sign(
            { 
                userId: updatedUser.id, 
                role: updatedUser.role, 
                username: updatedUser.username,
                avatar: updatedUser.avatarDataUri 
            }, 
            jwtSecret, 
            {
                expiresIn: '7d',
            }
        );
        
        const response = NextResponse.json({ message: 'Profile updated successfully', token });
        
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });


        return response;
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
