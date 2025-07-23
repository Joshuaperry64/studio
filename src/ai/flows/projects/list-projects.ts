
'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export const ListProjectsInputSchema = z.object({
    userId: z.string().describe("The ID of the user requesting the list, to filter for their private projects."),
});
export type ListProjectsInput = z.infer<typeof ListProjectsInputSchema>;

export const ProjectSummarySchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    isPrivate: z.boolean(),
    createdBy: z.string(),
    updatedAt: z.any(),
});

export const ListProjectsOutputSchema = z.object({
  projects: z.array(ProjectSummarySchema),
});
export type ListProjectsOutput = z.infer<typeof ListProjectsOutputSchema>;

export async function listProjects(input: ListProjectsInput): Promise<ListProjectsOutput> {
  return listProjectsFlow(input);
}

const listProjectsFlow = ai.defineFlow(
  {
    name: 'listProjectsFlow',
    inputSchema: ListProjectsInputSchema,
    outputSchema: ListProjectsOutputSchema,
  },
  async ({ userId }) => {
    try {
      const projectsCollection = collection(db, 'projects');
      
      // Query for public projects OR private projects created by the current user
      const publicProjectsQuery = query(
          projectsCollection, 
          where('isPrivate', '==', false),
          orderBy('updatedAt', 'desc')
        );

      const privateProjectsQuery = query(
          projectsCollection, 
          where('isPrivate', '==', true), 
          where('creatorId', '==', userId),
          orderBy('updatedAt', 'desc')
        );

      const [publicSnapshot, privateSnapshot] = await Promise.all([
          getDocs(publicProjectsQuery),
          getDocs(privateProjectsQuery),
      ]);

      const projects = [
          ...publicSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
          ...privateSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      ] as z.infer<typeof ProjectSummarySchema>[];

      // Since we can't do an OR query with different inequality fields in Firestore,
      // we fetch both and sort them in memory.
      projects.sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis());

      return { projects };
    } catch (error) {
      console.error('Error listing projects:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to list projects: ${errorMessage}`);
    }
  }
);
