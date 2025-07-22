// In a real application, you would use a database.
// For this example, we'll migrate to Firestore.
import bcrypt from 'bcryptjs';
import { db } from '@/ai/genkit'; // Import the Firestore instance
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export interface User {
  id?: string; // Use string for Firestore document ID
  username: string;
  pinHash: string;
  apiKeyEncrypted?: string;
  role: 'admin' | 'user';
  status: 'approved' | 'pending';
  avatarDataUri?: string;
}

export interface Feedback {
    id?: string; // Use string for Firestore document ID
    userId: string; // Use string for userId to match Firestore User ID
    username: string;
    feedback: string;
    createdAt: Date;
}

// Firestore collections references
const usersCollection = collection(db, 'users');
const feedbackCollection = collection(db, 'feedback');

// Function to get a user by ID
const getUserById = async (id: string) => {
    const userDocRef = doc(db, 'users', id);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return undefined;
};

// Function to get a user by username
const getUserByUsername = async (username: string) => {
    const usersQuery = query(usersCollection, where('username', '==', username));
    const usersSnapshot = await getDocs(usersQuery);
    if (!usersSnapshot.empty) {
        const userDoc = usersSnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return undefined;
};

// Function to create a new user
const createUser = async (data: { username: string; pinHash: string }) => {
    const newUserRef = await addDoc(usersCollection, {
        username: data.username,
        pinHash: data.pinHash,
        role: 'user', // Default role is 'user'
        status: 'pending', // New users require approval
        createdAt: new Date(),
    });
    return getUserById(newUserRef.id);
};

// Function to update a user
const updateUser = async (id: string, data: Partial<Omit<User, 'id' | 'pinHash'>>) => {
    const userDocRef = doc(db, 'users', id);
    await updateDoc(userDocRef, data);
    return getUserById(id);
};

// Function to delete a user
const deleteUser = async (id: string) => {
    const userDocRef = doc(db, 'users', id);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
        return undefined; // User not found
    }
    const userData = userSnap.data() as User;
    // Prevent admin deletion (assuming admin has a specific field or ID)
    if (userData.role === 'admin') { // Adjust this check based on how you identify admin
        throw new Error('Cannot delete administrator account.');
    }
    await deleteDoc(userDocRef);
    return { id: userSnap.id, ...userData } as User; // Return deleted user data
};

// Function to find many users (optional - for admin maybe)
const findManyUsers = async () => {
    const usersSnapshot = await getDocs(usersCollection);
    return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
};

// Feedback functions (update to use Firestore feedbackCollection)
const createFeedback = async (data: { userId: string, username: string, feedback: string }) => {
    const newFeedbackRef = await addDoc(feedbackCollection, {
        userId: data.userId,
        username: data.username,
        feedback: data.feedback,
        createdAt: new Date(),
    });
    const feedbackSnap = await getDoc(newFeedbackRef);
    return { id: feedbackSnap.id, ...feedbackSnap.data() } as Feedback;
};

const findManyFeedback = async () => {
    const feedbackSnapshot = await getDocs(feedbackCollection);
    return feedbackSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Feedback[];
};

// Export the new Firestore-based database operations
export const dbFirestore = {
    users: {
        findMany: findManyUsers,
        findUnique: async ({ where: { id, username } }: { where: { id?: string, username?: string } }) => {
            if (id) return getUserById(id);
            if (username) return getUserByUsername(username);
            return undefined;
        },
        create: createUser,
        update: updateUser,
        delete: deleteUser,
    },
    feedback: {
        create: createFeedback,
        findMany: findManyFeedback,
    },
};

// You will need to update the rest of your application to use dbFirestore instead of db for user and feedback operations.
// For example, in your authentication API routes and Genkit flows.

// Note: The pre-seeded admin user is no longer automatically created here.
// You may need a separate script or manual process to create the initial admin user in Firestore.
