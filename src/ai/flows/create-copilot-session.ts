'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export const CreateCoPilotSessionInputSchema = z.object({
  sessionName: z.string().describe('The name of the new co-pilot session.'),
  projectDescription: z.string().describe('The initial description of the project.'),
  aiPersonaDescription: z.string().describe('The description of the AI persona for the session.'),
  createdBy: z.string().describe('The username of the user creating the session.'),
});
export type CreateCoPilotSessionInput = z.infer<typeof CreateCoPilotSessionInputSchema>;


export const CreateCoPilotSessionOutputSchema = z.object({
  sessionId: z.string().describe('The ID of the newly created session.'),
});
export type CreateCoPilotSessionOutput = z.infer<typeof CreateCoPilotSessionOutputSchema>;


export async function createCoPilotSession(input: CreateCoPilotSessionInput): Promise<CreateCoPilotSessionOutput> {
    return createCoPilotSessionFlow(input);
}


const createCoPilotSessionFlow = ai.defineFlow(
  {
    name: 'createCoPilotSessionFlow',
    inputSchema: CreateCoPilotSessionInputSchema,
    outputSchema: CreateCoPilotSessionOutputSchema,
  },
  async (input) => {
    try {
      const sessionsCollection = collection(db, 'copilot-sessions');
      const newSessionRef = await addDoc(sessionsCollection, {
        name: input.sessionName,
        projectDescription: input.projectDescription,
        aiPersonaDescription: input.aiPersonaDescription,
        createdBy: input.createdBy,
        createdAt: Timestamp.now(),
      });

      return { sessionId: newSessionRef.id };
    } catch (error) {
      console.error('Error creating co-pilot session:', error);
      throw new Error('Failed to create co-pilot session.');
    }
  }
);
