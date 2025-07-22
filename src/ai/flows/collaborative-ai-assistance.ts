// This is a server-side file.
'use server';

/**
 * @fileOverview A collaborative AI assistance flow that analyzes group suggestions
 *  and incorporates them into a project.
 *
 * - collaborativeAiAssistance - A function that handles the collaborative AI assistance process.
 * - CollaborativeAiAssistanceInput - The input type for the collaborativeAiAssistance function.
 * - CollaborativeAiAssistanceOutput - The return type for the collaborativeAiAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CollaborativeAiAssistanceInputSchema = z.object({
  projectDescription: z.string().describe('The description of the collaborative project.'),
  groupSuggestions: z.array(z.string()).describe('An array of suggestions from the group members.'),
  aiPersonaDescription: z.string().describe('Description of the AI persona to be used for assistance.'),
});
export type CollaborativeAiAssistanceInput = z.infer<typeof CollaborativeAiAssistanceInputSchema>;

const CollaborativeAiAssistanceOutputSchema = z.object({
  analyzedSuggestions: z.array(z.object({
    suggestion: z.string().describe('The original suggestion.'),
    incorporationRationale: z.string().describe('The AI rationale for incorporating or rejecting the suggestion.'),
    isIncorporated: z.boolean().describe('Whether the suggestion is incorporated into the project.'),
  })).describe('The analyzed suggestions with incorporation rationales.'),
  revisedProjectDescription: z.string().describe('The revised description of the collaborative project after incorporating suggestions.'),
});
export type CollaborativeAiAssistanceOutput = z.infer<typeof CollaborativeAiAssistanceOutputSchema>;

export async function collaborativeAiAssistance(input: CollaborativeAiAssistanceInput): Promise<CollaborativeAiAssistanceOutput> {
  return collaborativeAiAssistanceFlow(input);
}

const collaborativeAiAssistancePrompt = ai.definePrompt({
  name: 'collaborativeAiAssistancePrompt',
  input: {schema: CollaborativeAiAssistanceInputSchema},
  output: {schema: CollaborativeAiAssistanceOutputSchema},
  prompt: `You are an AI assistant helping a group collaborate on a project.
Your persona is described as: {{{aiPersonaDescription}}}.
The project is described as: {{{projectDescription}}}.
The group has provided the following suggestions:

{{#each groupSuggestions}}
- {{{this}}}
{{/each}}

Analyze each suggestion and determine whether it should be incorporated into the project.
Provide a rationale for each decision. Return a list of analyzed suggestions including incorporation rationale and whether each suggestion is incorporated.
Finally, revise the project description to reflect the incorporated suggestions.
`,
});

const collaborativeAiAssistanceFlow = ai.defineFlow(
  {
    name: 'collaborativeAiAssistanceFlow',
    inputSchema: CollaborativeAiAssistanceInputSchema,
    outputSchema: CollaborativeAiAssistanceOutputSchema,
  },
  async input => {
    const {output} = await collaborativeAiAssistancePrompt(input);
    return output!;
  }
);
