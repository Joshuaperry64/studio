
'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export const RunProjectAnalysisInputSchema = z.object({
  projectId: z.string().describe('The ID of the project to analyze.'),
});
type RunProjectAnalysisInput = z.infer<typeof RunProjectAnalysisInputSchema>;

export const RunProjectAnalysisOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
type RunProjectAnalysisOutput = z.infer<typeof RunProjectAnalysisOutputSchema>;

const AnalysisOutputSchema = z.object({
  analyzedSuggestions: z.array(z.object({
    suggestion: z.string().describe('The original suggestion.'),
    incorporationRationale: z.string().describe('The AI rationale for incorporating or rejecting the suggestion.'),
    isIncorporated: z.boolean().describe('Whether the suggestion is incorporated into the project.'),
  })).describe('The analyzed suggestions with incorporation rationales.'),
  revisedDocumentation: z.string().describe('The completely revised documentation incorporating the accepted suggestions.'),
});

const analysisPrompt = ai.definePrompt({
    name: 'projectAnalysisPrompt',
    input: { schema: z.object({
        documentation: z.string(),
        suggestions: z.array(z.string())
    })},
    output: { schema: AnalysisOutputSchema },
    prompt: `You are an expert project manager and technical writer. Your task is to analyze a list of suggestions and integrate the good ones into the project documentation.
    
The current documentation is as follows:
---
{{{documentation}}}
---

Here are the suggestions from the team:
{{#each suggestions}}
- {{{this}}}
{{/each}}

Analyze each suggestion. For each one, decide if it should be incorporated. Provide a clear rationale for your decision.
Then, rewrite the *entire* project documentation from scratch, seamlessly integrating all the suggestions you've decided to incorporate. Ensure the final documentation is coherent, well-structured, and complete.
`,
});

export async function runProjectAnalysis(input: RunProjectAnalysisInput): Promise<RunProjectAnalysisOutput> {
  return runProjectAnalysisFlow(input);
}

const runProjectAnalysisFlow = ai.defineFlow(
  {
    name: 'runProjectAnalysisFlow',
    inputSchema: RunProjectAnalysisInputSchema,
    outputSchema: RunProjectAnalysisOutputSchema,
  },
  async ({ projectId }) => {
    const projectRef = doc(db, 'projects', projectId);
    
    try {
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists()) {
        throw new Error('Project not found.');
      }
      
      const projectData = projectSnap.data();

      if (!projectData.suggestions || projectData.suggestions.length === 0) {
        return { success: false, message: 'No suggestions to analyze.' };
      }

      const { output } = await analysisPrompt({
          documentation: projectData.documentation || '',
          suggestions: projectData.suggestions,
      });

      if (!output) {
          throw new Error('AI analysis failed to produce a result.');
      }

      // Update the project with the analysis result and the new documentation
      await updateDoc(projectRef, {
        analysis: output,
        documentation: output.revisedDocumentation, // Overwrite documentation with AI's revision
      });
      
      return { success: true, message: 'Analysis complete and project updated.' };

    } catch (error) {
      console.error('Error running project analysis:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      throw new Error(`Failed to run project analysis: ${errorMessage}`);
    }
  }
);
