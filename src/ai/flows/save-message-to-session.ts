'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, collection, addDoc, Timestamp, getDoc } from 'firebase/firestore';

export const SaveMessageToSessionInputSchema = z.object({
  sessionId: z.string().describe('The ID of the collaborative session.'),
  userId: z.string().describe('The ID of the message sender.'),
  username: z.string().describe('The username of the message sender.'),
  text: z.string().optional().describe('The text content of the message.'),
  mediaUrl: z.string().optional().describe('The URL of any media attached to the message.'),
});
export type SaveMessageToSessionInput = z.infer<typeof SaveMessageToSessionInputSchema>;

export const SaveMessageToSessionOutputSchema = z.object({
  success: z.boolean().describe('Indicates if the message was saved successfully.'),
  messageId: z.string().optional().describe('The ID of the newly saved message.'),
  errorMessage: z.string().optional().describe('An error message if saving failed.'),
});
export type SaveMessageToSessionOutput = z.infer<typeof SaveMessageToSessionOutputSchema>;


export async function saveMessageToSession(input: SaveMessageToSessionInput): Promise<SaveMessageToSessionOutput> {
    return saveMessageToSessionFlow(input);
}


const saveMessageToSessionFlow = ai.defineFlow(
  {
    name: 'saveMessageToSessionFlow',
    inputSchema: SaveMessageToSessionInputSchema,
    outputSchema: SaveMessageToSessionOutputSchema,
  },
  async (input) => {
    try {
      const sessionRef = doc(db, 'sessions', input.sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        return { success: false, errorMessage: 'Session not found.' };
      }

      const messagesCollectionRef = collection(sessionRef, 'messages');

      const newMessageRef = await addDoc(messagesCollectionRef, {
        senderId: input.userId,
        senderUsername: input.username,
        text: input.text,
        mediaUrl: input.mediaUrl,
        timestamp: Timestamp.now(),
      });

      return { success: true, messageId: newMessageRef.id };
    } catch (error) {
      console.error('Error saving message to session:', error);
      return { success: false, errorMessage: 'Failed to save message to session.' };
    }
  }
);
