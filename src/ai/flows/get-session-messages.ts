'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, collection, getDocs, query, orderBy, Timestamp, getDoc } from 'firebase/firestore';

const GetSessionMessagesInputSchema = z.object({
  sessionId: z.string().describe('The ID of the collaborative session.'),
});

const GetSessionMessagesOutputSchema = z.object({
  messages: z.array(
    z.object({
      senderId: z.string().describe('The ID of the message sender.'),
      senderUsername: z.string().describe('The username of the message sender.'),
      text: z.string().optional().describe('The text content of the message.'),
      mediaUrl: z.string().optional().describe('The URL of any media attached to the message.'),
      timestamp: z.any().describe('The timestamp of the message.'), // Use z.any for Timestamp type
    })
  ).describe('The list of messages in the session, ordered by timestamp.'),
  errorMessage: z.string().optional().describe('An error message if fetching failed.'),
});

export const getSessionMessagesFlow = ai.defineFlow(
  {
    name: 'getSessionMessagesFlow',
    inputSchema: GetSessionMessagesInputSchema,
    outputSchema: GetSessionMessagesOutputSchema,
  },
  async (input) => {
    try {
      const sessionRef = doc(db, 'sessions', input.sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        return { messages: [], errorMessage: 'Session not found.' };
      }

      const messagesCollectionRef = collection(sessionRef, 'messages');
      const messagesQuery = query(messagesCollectionRef, orderBy('timestamp'));
      const messagesSnapshot = await getDocs(messagesQuery);

      const messages = messagesSnapshot.docs.map(doc => doc.data());

      return { messages: messages as any[] }; // Cast to any[] to match schema due to Timestamp
    } catch (error) {
      console.error('Error getting session messages:', error);
      return { messages: [], errorMessage: 'Failed to get session messages.' };
    }
  }
);
