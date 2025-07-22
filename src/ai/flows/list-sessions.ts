'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, getDocs } from 'firebase/firestore';

const ListSessionsInputSchema = z.undefined(); // No specific input needed for listing all sessions

const ListSessionsOutputSchema = z.object({
  sessions: z.array(
    z.object({
      id: z.string().describe('The ID of the session.'),
      name: z.string().describe('The name of the session.'),
      createdAt: z.any().describe('The timestamp when the session was created.'), // Use z.any for Timestamp type
      // Include other session properties here if needed
    })
  ).describe('The list of collaborative sessions.'),
  errorMessage: z.string().optional().describe('An error message if fetching failed.'),
});

export const listSessionsFlow = ai.defineFlow(
  {
    name: 'listSessionsFlow',
    inputSchema: ListSessionsInputSchema,
    outputSchema: ListSessionsOutputSchema,
  },
  async () => {
    try {
      const sessionsCollectionRef = collection(db, 'sessions');
      const sessionsSnapshot = await getDocs(sessionsCollectionRef);

      const sessions = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { sessions: sessions as any[] }; // Cast to any[] to match schema due to Timestamp
    } catch (error) {
      console.error('Error listing sessions:', error);
      return { sessions: [], errorMessage: 'Failed to list collaborative sessions.' };
    }
  }
);
