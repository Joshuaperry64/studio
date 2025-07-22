'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const CreateSessionInputSchema = z.object({
  sessionName: z.string().describe('The name of the new collaborative session.'),
});

const CreateSessionOutputSchema = z.object({
  sessionId: z.string().describe('The ID of the newly created session.'),
});

export const createSessionFlow = ai.defineFlow(
  {
    name: 'createSessionFlow',
    inputSchema: CreateSessionInputSchema,
    outputSchema: CreateSessionOutputSchema,
  },
  async (input) => {
    try {
      const sessionsCollection = collection(db, 'sessions');
      const newSessionRef = await addDoc(sessionsCollection, {
        name: input.sessionName,
        createdAt: Timestamp.now(),
        // Add other session properties here if needed (e.g., ownerId)
      });

      return { sessionId: newSessionRef.id };
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create collaborative session.');
    }
  }
);
