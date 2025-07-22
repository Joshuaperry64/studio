'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/ai/genkit'; // Import the Firestore instance
import { collection, query, where, getDocs } from 'firebase/firestore';

const GetUserByUsernameInputSchema = z.object({
  username: z.string().describe('The username of the user to fetch.'),
});

const GetUserByUsernameOutputSchema = z.object({
  userId: z.string().optional().describe('The ID of the user.'),
  username: z.string().optional().describe('The username of the user.'),
  errorMessage: z.string().optional().describe('An error message if the user was not found or fetching failed.'),
});

export const getUserByUsernameFlow = ai.defineFlow(
  {
    name: 'getUserByUsernameFlow',
    inputSchema: GetUserByUsernameInputSchema,
    outputSchema: GetUserByUsernameOutputSchema,
  },
  async (input) => {
    try {
      const usersCollectionRef = collection(db, 'users');
      const userQuery = query(usersCollectionRef, where('username', '==', input.username));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        return { errorMessage: `User with username "${input.username}" not found.` };
      }

      // Assuming usernames are unique, get the first document
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();

      return { userId: userDoc.id, username: userData.username };

    } catch (error) {
      console.error('Error fetching user by username:', error);
      return { errorMessage: 'Failed to fetch user by username.' };
    }
  }
);
