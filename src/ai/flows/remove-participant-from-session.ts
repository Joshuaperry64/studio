'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, collection, query, where, getDocs, deleteDoc, getDoc } from 'firebase/firestore';

export const RemoveParticipantFromSessionInputSchema = z.object({
  sessionId: z.string().describe('The ID of the collaborative session.'),
  userId: z.string().describe('The ID of the user to remove.'),
});
export type RemoveParticipantFromSessionInput = z.infer<typeof RemoveParticipantFromSessionInputSchema>;

export const RemoveParticipantFromSessionOutputSchema = z.object({
  success: z.boolean().describe('Indicates if the participant was removed successfully.'),
  message: z.string().describe('A message describing the result.'),
});
export type RemoveParticipantFromSessionOutput = z.infer<typeof RemoveParticipantFromSessionOutputSchema>;


export async function removeParticipantFromSession(input: RemoveParticipantFromSessionInput): Promise<RemoveParticipantFromSessionOutput> {
    return removeParticipantFromSessionFlow(input);
}


const removeParticipantFromSessionFlow = ai.defineFlow(
  {
    name: 'removeParticipantFromSessionFlow',
    inputSchema: RemoveParticipantFromSessionInputSchema,
    outputSchema: RemoveParticipantFromSessionOutputSchema,
  },
  async (input) => {
    try {
      const sessionRef = doc(db, 'sessions', input.sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        return { success: false, message: 'Session not found.' };
      }

      const participantsCollectionRef = collection(sessionRef, 'participants');
      const participantQuery = query(participantsCollectionRef, where('userId', '==', input.userId));
      const participantSnapshot = await getDocs(participantQuery);

      if (participantSnapshot.empty) {
        return { success: false, message: 'Participant not found in this session.' };
      }

      // Assuming there's only one document per user in the participants subcollection
      const participantDoc = participantSnapshot.docs[0];
      await deleteDoc(participantDoc.ref);

      return { success: true, message: 'Participant removed successfully.' };
    } catch (error) {
      console.error('Error removing participant from session:', error);
      return { success: false, message: 'Failed to remove participant from session.' };
    }
  }
);
