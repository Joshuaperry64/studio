
'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';

export const UpdateProjectInputSchema = z.object({
  projectId: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  isPrivate: z.boolean().optional(),
  roadmap: z.string().optional(),
  canvas: z.string().optional(),
  documentation: z.string().optional(),
});
export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>;

export const UpdateProjectOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type UpdateProjectOutput = z.infer<typeof UpdateProjectOutputSchema>;

export async function updateProject(input: UpdateProjectInput): Promise<UpdateProjectOutput> {
  return updateProjectFlow(input);
}

const updateProjectFlow = ai.defineFlow(
  {
    name: 'updateProjectFlow',
    inputSchema: UpdateProjectInputSchema,
    outputSchema: UpdateProjectOutputSchema,
  },
  async (input) => {
    const { projectId, ...updates } = input;
    if (Object.keys(updates).length === 0) {
      return { success: false, message: 'No updates provided.' };
    }

    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
      return { success: true, message: 'Project updated successfully.' };
    } catch (error) {
      console.error('Error updating project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update project: ${errorMessage}`);
    }
  }
);
