'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, collection, addDoc, getDoc } from 'firebase/firestore';

export const AddParticipantToSessionInputSchema = z.object({
  sessionId: z.string().describe('The ID of the collaborative session.'),
  userId: z.string().describe('The ID of the user to add.'),
  username: z.string().describe('The username of the user to add.'),
});
export type AddParticipantToSessionInput = z.infer<typeof AddParticipantToSessionInputSchema>;


export const AddParticipantToSessionOutputSchema = z.object({
  success: z.boolean().describe('Indicates if the participant was added successfully.'),
  message: z.string().describe('A message describing the result.'),
});
export type AddParticipantToSessionOutput = z.infer<typeof AddParticipantToSessionOutputSchema>;


export async function addParticipantToSession(input: AddParticipantToSessionInput): Promise<AddParticipantToSessionOutput> {
    return addParticipantToSessionFlow(input);
}


const addParticipantToSessionFlow = ai.defineFlow(
  {
    name: 'addParticipantToSessionFlow',
    inputSchema: AddParticipantToSessionInputSchema,
    outputSchema: AddParticipantToSessionOutputSchema,
  },
  async (input) => {
    try {
      const sessionRef = doc(db, 'sessions', input.sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        return { success: false, message: 'Session not found.' };
      }

      const participantsCollectionRef = collection(sessionRef, 'participants');

      // Optional: Check if participant already exists (requires querying subcollection)
      // For simplicity, we'll allow adding the same user multiple times for now,
      // but in a real app, you'd add logic here to prevent duplicates.

      await addDoc(participantsCollectionRef, {
        userId: input.userId,
        username: input.username,
        joinedAt: new Date(),
      });

      return { success: true, message: 'Participant added successfully.' };
    } catch (error) {
      console.error('Error adding participant to session:', error);
      throw new Error('Failed to add participant to session.');
    }
  }
);
