
'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const UpdateWorldEntityInputSchema = z.object({
  worldId: z.string().describe('The ID of the world.'),
  entityId: z.string().describe('The ID of the entity to update.'),
  updates: z.record(z.any()).describe('An object with the fields to update.'),
});
type UpdateWorldEntityInput = z.infer<typeof UpdateWorldEntityInputSchema>;

const UpdateWorldEntityOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
type UpdateWorldEntityOutput = z.infer<typeof UpdateWorldEntityOutputSchema>;

export async function updateWorldEntity(input: UpdateWorldEntityInput): Promise<UpdateWorldEntityOutput> {
  return updateWorldEntityFlow(input);
}

const updateWorldEntityFlow = ai.defineFlow(
  {
    name: 'updateWorldEntityFlow',
    inputSchema: UpdateWorldEntityInputSchema,
    outputSchema: UpdateWorldEntityOutputSchema,
  },
  async ({ worldId, entityId, updates }) => {
    try {
      const entityRef = doc(db, 'virtual-worlds', worldId, 'entities', entityId);
      const entitySnap = await getDoc(entityRef);

      if (!entitySnap.exists()) {
          return { success: false, message: `Entity '${entityId}' not found in world '${worldId}'.` };
      }

      await updateDoc(entityRef, updates);

      return { success: true, message: `Entity '${entityId}' updated successfully.` };
    } catch (error) {
      console.error('Error updating world entity:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update world entity: ${errorMessage}`);
    }
  }
);
