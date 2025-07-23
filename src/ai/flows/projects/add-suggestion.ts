
'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';

export const AddSuggestionInputSchema = z.object({
  projectId: z.string().describe('The ID of the project.'),
  suggestion: z.string().describe('The suggestion text to add.'),
});
type AddSuggestionInput = z.infer<typeof AddSuggestionInputSchema>;

export const AddSuggestionOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
type AddSuggestionOutput = z.infer<typeof AddSuggestionOutputSchema>;

export async function addSuggestion(input: AddSuggestionInput): Promise<AddSuggestionOutput> {
  return addSuggestionFlow(input);
}

const addSuggestionFlow = ai.defineFlow(
  {
    name: 'addSuggestionFlow',
    inputSchema: AddSuggestionInputSchema,
    outputSchema: AddSuggestionOutputSchema,
  },
  async ({ projectId, suggestion }) => {
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        suggestions: arrayUnion(suggestion),
        updatedAt: Timestamp.now(),
      });
      return { success: true, message: 'Suggestion added.' };
    } catch (error) {
      console.error('Error adding suggestion:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to add suggestion: ${errorMessage}`);
    }
  }
);
