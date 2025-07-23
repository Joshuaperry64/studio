
'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, addDoc, doc } from 'firebase/firestore';

const WorldEventSchema = z.object({
  timestamp: z.any().describe('The timestamp of the event.'),
  description: z.string().describe('A human-readable description of the event.'),
  details: z.record(z.any()).optional().describe('Any additional structured data about the event.'),
});

const AddWorldEventInputSchema = z.object({
  worldId: z.string().describe('The ID of the world where the event occurs.'),
  event: WorldEventSchema,
});
type AddWorldEventInput = z.infer<typeof AddWorldEventInputSchema>;

const AddWorldEventOutputSchema = z.object({
  eventId: z.string().describe('The ID of the newly created event.'),
});
type AddWorldEventOutput = z.infer<typeof AddWorldEventOutputSchema>;

export async function addWorldEvent(input: AddWorldEventInput): Promise<AddWorldEventOutput> {
  return addWorldEventFlow(input);
}

const addWorldEventFlow = ai.defineFlow(
  {
    name: 'addWorldEventFlow',
    inputSchema: AddWorldEventInputSchema,
    outputSchema: AddWorldEventOutputSchema,
  },
  async ({ worldId, event }) => {
    try {
      const eventsCollectionRef = collection(db, 'virtual-worlds', worldId, 'events');
      const newEventRef = await addDoc(eventsCollectionRef, event);
      return { eventId: newEventRef.id };
    } catch (error) {
      console.error('Error adding world event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to add world event: ${errorMessage}`);
    }
  }
);
