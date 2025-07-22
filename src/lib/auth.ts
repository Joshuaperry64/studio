
// This file is now primarily for type definitions and client-side auth logic if needed.
// Server-side database logic has been moved directly into the API routes for clarity and consistency.

export interface User {
  id: string; // Use string for Firestore document ID
  username: string;
  pinHash: string;
  apiKeyEncrypted?: string;
  role: 'admin' | 'user';
  status: 'approved' | 'pending';
  avatarDataUri?: string;
}

export interface Feedback {
    id: string; // Use string for Firestore document ID
    userId: string;
    username:string;
    feedback: string;
    createdAt: Date;
}
