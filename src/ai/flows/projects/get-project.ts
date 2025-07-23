
'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, getDoc } from 'firebase/firestore';

export const GetProjectInputSchema = z.object({
  projectId: z.string().describe('The ID of the project to retrieve.'),
});
export type GetProjectInput = z.infer<typeof GetProjectInputSchema>;

export const ProjectSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    isPrivate: z.boolean(),
    createdBy: z.string(),
    creatorId: z.string(),
    createdAt: z.any(), // For Firestore Timestamp
    updatedAt: z.any(), // For Firestore Timestamp
    roadmap: z.string().optional(),
    canvas: z.string().optional(),
    documentation: z.string().optional(),
    suggestions: z.array(z.string()).optional(),
    analysis: z.any().optional(),
});
export type Project = z.infer<typeof ProjectSchema>;

export async function getProject(input: GetProjectInput): Promise<Project | null> {
  return getProjectFlow(input);
}

const getProjectFlow = ai.defineFlow(
  {
    name: 'getProjectFlow',
    inputSchema: GetProjectInputSchema,
    outputSchema: ProjectSchema.nullable(),
  },
  async ({ projectId }) => {
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);

      if (!projectSnap.exists()) {
        return null;
      }

      return {
        id: projectSnap.id,
        ...projectSnap.data(),
      } as Project;

    } catch (error) {
      console.error('Error getting project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get project: ${errorMessage}`);
    }
  }
);
