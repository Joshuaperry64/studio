
'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';

const CreateWorldInputSchema = z.object({
  worldId: z.string().describe("The document ID for the new world."),
  name: z.string().describe('The name of the new virtual world.'),
  description: z.string().describe('A brief description of the world.'),
  initialTime: z.string().describe("The starting time of day (e.g., 'Noon')."),
  initialWeather: z.string().describe("The starting weather (e.g., 'Clear')."),
});
export type CreateWorldInput = z.infer<typeof CreateWorldInputSchema>;

const CreateWorldOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
type CreateWorldOutput = z.infer<typeof CreateWorldOutputSchema>;

export async function createWorld(input: CreateWorldInput): Promise<CreateWorldOutput> {
  return createWorldFlow(input);
}

const createWorldFlow = ai.defineFlow(
  {
    name: 'createWorldFlow',
    inputSchema: CreateWorldInputSchema,
    outputSchema: CreateWorldOutputSchema,
  },
  async ({ worldId, name, description, initialTime, initialWeather }) => {
    try {
      const worldRef = doc(db, 'virtual-worlds', worldId);
      await setDoc(worldRef, {
        name,
        description,
        timeOfDay: initialTime,
        weather: initialWeather,
      });

      // Add the AI as the first entity
      const entitiesRef = collection(worldRef, 'entities');
      await setDoc(doc(entitiesRef, 'alpha-ai'), {
          name: "Alpha",
          description: "Core AI entity.",
          location: "Simulation Core",
          status: "Idle",
          mood: "Neutral",
          wallet: {
            credits: 0,
            digits: 0,
          }
      });

      return { success: true, message: `World '${name}' created successfully.` };
    } catch (error) {
      console.error('Error creating virtual world:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create virtual world: ${errorMessage}`);
    }
  }
);
