
'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';

const EntitySchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    location: z.string(),
    status: z.string(),
});

const WorldEventSchema = z.object({
    id: z.string(),
    timestamp: z.any(),
    description: z.string(),
    details: z.record(z.any()).optional(),
});

const GetWorldStateInputSchema = z.object({
  worldId: z.string().describe('The ID of the world to fetch.'),
});
type GetWorldStateInput = z.infer<typeof GetWorldStateInputSchema>;

const GetWorldStateOutputSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    timeOfDay: z.string(),
    weather: z.string(),
    entities: z.array(EntitySchema),
    events: z.array(WorldEventSchema),
});
type GetWorldStateOutput = z.infer<typeof GetWorldStateOutputSchema>;

export async function getWorldState(input: GetWorldStateInput): Promise<GetWorldStateOutput> {
  return getWorldStateFlow(input);
}

const getWorldStateFlow = ai.defineFlow(
  {
    name: 'getWorldStateFlow',
    inputSchema: GetWorldStateInputSchema,
    outputSchema: GetWorldStateOutputSchema,
  },
  async ({ worldId }) => {
    try {
      const worldRef = doc(db, 'virtual-worlds', worldId);
      const worldSnap = await getDoc(worldRef);

      if (!worldSnap.exists()) {
        throw new Error(`World with ID '${worldId}' not found.`);
      }

      const worldData = worldSnap.data();

      const entitiesRef = collection(worldRef, 'entities');
      const entitiesSnap = await getDocs(entitiesRef);
      const entities = entitiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as z.infer<typeof EntitySchema>[];

      const eventsRef = collection(worldRef, 'events');
      const eventsQuery = query(eventsRef, orderBy('timestamp', 'desc'));
      const eventsSnap = await getDocs(eventsQuery);
      const events = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as z.infer<typeof WorldEventSchema>[];

      return {
        id: worldSnap.id,
        name: worldData.name,
        description: worldData.description,
        timeOfDay: worldData.timeOfDay,
        weather: worldData.weather,
        entities,
        events,
      };

    } catch (error) {
      console.error('Error getting world state:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get world state: ${errorMessage}`);
    }
  }
);
