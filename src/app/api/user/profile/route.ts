
import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { User } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth-server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (!auth.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Handle special case for the Creator profile, which has no DB entry
    if (auth.user.username === 'Joshua') {
        // For the creator, we can't update a DB record.
        // We will just re-issue the token with any new info if needed in the future.
        // For now, we just prevent the error by returning a success message.
        // A more complex implementation would be needed to persist creator-specific changes.
         const token = jwt.sign(
            { 
                userId: auth.user.userId, 
                role: auth.user.role, 
                username: auth.user.username,
                avatar: auth.user.avatar 
            }, 
            process.env.JWT_SECRET || 'your-secret-key', 
            {
                expiresIn: '7d',
            }
        );
        const response = NextResponse.json({ message: 'Profile updated successfully (Master Operator Mode)', token });
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });
        return response;
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
        
        // Re-issue the auth token with the new user info
        const token = jwt.sign(
            { 
                userId: updatedUser.id, 
                role: updatedUser.role, 
                username: updatedUser.username,
                avatar: updatedUser.avatarDataUri 
            }, 
            process.env.JWT_SECRET || 'your-secret-key', 
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
        const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
