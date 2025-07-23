
'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export const CreateProjectInputSchema = z.object({
  name: z.string().describe('The name of the new project.'),
  description: z.string().describe('A brief description of the project.'),
  isPrivate: z.boolean().describe('Whether the project is private or public.'),
  createdBy: z.string().describe('The username of the user creating the project.'),
  creatorId: z.string().describe('The ID of the user creating the project.'),
});
export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;

export const CreateProjectOutputSchema = z.object({
  projectId: z.string().describe('The ID of the newly created project.'),
});
export type CreateProjectOutput = z.infer<typeof CreateProjectOutputSchema>;

export async function createProject(input: CreateProjectInput): Promise<CreateProjectOutput> {
  return createProjectFlow(input);
}

const createProjectFlow = ai.defineFlow(
  {
    name: 'createProjectFlow',
    inputSchema: CreateProjectInputSchema,
    outputSchema: CreateProjectOutputSchema,
  },
  async (input) => {
    try {
      const projectsCollection = collection(db, 'projects');
      const newProjectRef = await addDoc(projectsCollection, {
        ...input,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        // Initialize other fields
        roadmap: '# Project Roadmap\n\n## Phase 1\n\n- [ ] Task 1',
        canvas: '## Project Canvas\n\nStart brainstorming here...',
        documentation: '# Project Documentation\n\nBegin writing documentation here.',
        suggestions: [],
        analysis: null,
      });

      return { projectId: newProjectRef.id };
    } catch (error) {
      console.error('Error creating project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create project: ${errorMessage}`);
    }
  }
);
