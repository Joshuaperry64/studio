'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

const GetCoPilotSessionInputSchema = z.object({
  sessionId: z.string().describe('The ID of the co-pilot session.'),
});

const CoPilotSessionSchema = z.object({
      id: z.string(),
      name: z.string(),
      projectDescription: z.string(),
      aiPersonaDescription: z.string(),
      createdBy: z.string(),
      createdAt: z.any(), // For Firestore Timestamp
      suggestions: z.array(z.string()).optional(),
      analysis: z.any().optional(), // Could be more specific later
});


export const getCoPilotSessionFlow = ai.defineFlow(
  {
    name: 'getCoPilotSessionFlow',
    inputSchema: GetCoPilotSessionInputSchema,
    outputSchema: CoPilotSessionSchema.optional(),
  },
  async (input) => {
    try {
      const sessionRef = doc(db, 'copilot-sessions', input.sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        return undefined;
      }

      return {
        id: sessionSnap.id,
        ...sessionSnap.data()
      } as z.infer<typeof CoPilotSessionSchema>;
    } catch (error) {
      console.error('Error getting co-pilot session:', error);
      throw new Error('Failed to get co-pilot session.');
    }
  }
);
