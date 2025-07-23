'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, collection, getDocs, getDoc } from 'firebase/firestore';

const GetSessionParticipantsInputSchema = z.object({
  sessionId: z.string().describe('The ID of the collaborative session.'),
});
type GetSessionParticipantsInput = z.infer<typeof GetSessionParticipantsInputSchema>;


const GetSessionParticipantsOutputSchema = z.object({
  participants: z.array(
    z.object({
      userId: z.string().describe('The ID of the participant.'),
      username: z.string().describe('The username of the participant.'),
      joinedAt: z.any().describe('The timestamp when the participant joined.'), // Use z.any for Timestamp type
    })
  ).describe('The list of participants in the session.'),
  errorMessage: z.string().optional().describe('An error message if fetching failed.'),
});
type GetSessionParticipantsOutput = z.infer<typeof GetSessionParticipantsOutputSchema>;


export async function getSessionParticipants(input: GetSessionParticipantsInput): Promise<GetSessionParticipantsOutput> {
    return getSessionParticipantsFlow(input);
}


const getSessionParticipantsFlow = ai.defineFlow(
  {
    name: 'getSessionParticipantsFlow',
    inputSchema: GetSessionParticipantsInputSchema,
    outputSchema: GetSessionParticipantsOutputSchema,
  },
  async (input) => {
    try {
      const sessionRef = doc(db, 'sessions', input.sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        return { participants: [], errorMessage: 'Session not found.' };
      }

      const participantsCollectionRef = collection(sessionRef, 'participants');
      const participantsSnapshot = await getDocs(participantsCollectionRef);

      const participants = participantsSnapshot.docs.map(doc => doc.data());

      return { participants: participants as any[] }; // Cast to any[] to match schema due to Timestamp
    } catch (error) {
      console.error('Error getting session participants:', error);
      return { participants: [], errorMessage: 'Failed to get session participants.' };
    }
  }
);
