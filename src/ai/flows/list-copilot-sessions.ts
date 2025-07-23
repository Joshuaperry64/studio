'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const ListCoPilotSessionsOutputSchema = z.object({
  sessions: z.array(
    z.object({
      id: z.string().describe('The ID of the session.'),
      name: z.string().describe('The name of the session.'),
      projectDescription: z.string().describe('The description of the project.'),
      aiPersonaDescription: z.string().describe('The description of the AI persona.'),
      createdBy: z.string().describe('The user who created the session.'),
      createdAt: z.any().describe('The timestamp when the session was created.'),
    })
  ).describe('The list of co-pilot sessions.'),
  errorMessage: z.string().optional().describe('An error message if fetching failed.'),
});
type ListCoPilotSessionsOutput = z.infer<typeof ListCoPilotSessionsOutputSchema>;


export async function listCoPilotSessions(): Promise<ListCoPilotSessionsOutput> {
    return listCoPilotSessionsFlow();
}


const listCoPilotSessionsFlow = ai.defineFlow(
  {
    name: 'listCoPilotSessionsFlow',
    inputSchema: z.undefined(),
    outputSchema: ListCoPilotSessionsOutputSchema,
  },
  async () => {
    try {
      const sessionsCollectionRef = collection(db, 'copilot-sessions');
      const q = query(sessionsCollectionRef, orderBy('createdAt', 'desc'));
      const sessionsSnapshot = await getDocs(q);

      const sessions = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return { sessions: sessions as any[] };
    } catch (error) {
      console.error('Error listing co-pilot sessions:', error);
      return { sessions: [], errorMessage: 'Failed to list co-pilot sessions.' };
    }
  }
);
