'use server';

import { ai, db } from '@/ai/genkit';
import { z } from 'genkit';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { collaborativeAiAssistance } from './collaborative-ai-assistance';

const UpdateCoPilotSessionInputSchema = z.object({
  sessionId: z.string().describe('The ID of the co-pilot session to update.'),
  suggestions: z.array(z.string()).optional().describe('An array of new suggestions to add.'),
  runAnalysis: z.boolean().optional().describe('Set to true to trigger the AI analysis.'),
});

const UpdateCoPilotSessionOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const updateCoPilotSessionFlow = ai.defineFlow(
  {
    name: 'updateCoPilotSessionFlow',
    inputSchema: UpdateCoPilotSessionInputSchema,
    outputSchema: UpdateCoPilotSessionOutputSchema,
  },
  async (input) => {
    const sessionRef = doc(db, 'copilot-sessions', input.sessionId);
    
    try {
      const sessionSnap = await getDoc(sessionRef);
      if (!sessionSnap.exists()) {
        throw new Error('Session not found.');
      }
      
      const sessionData = sessionSnap.data();

      // If runAnalysis is true, perform the analysis
      if (input.runAnalysis) {
        if (!sessionData.suggestions || sessionData.suggestions.length === 0) {
            return { success: false, message: 'No suggestions to analyze.' };
        }

        const analysisResult = await collaborativeAiAssistance({
          projectDescription: sessionData.projectDescription,
          groupSuggestions: sessionData.suggestions,
          aiPersonaDescription: sessionData.aiPersonaDescription,
        });

        await updateDoc(sessionRef, {
          analysis: analysisResult,
        });
        
        return { success: true, message: 'Analysis complete and session updated.' };
      }

      // If suggestions are provided, add them
      if (input.suggestions && input.suggestions.length > 0) {
        // This replaces the whole array. Use arrayUnion to just add.
        // Let's replace for simplicity now to avoid duplicate suggestions.
        await updateDoc(sessionRef, {
           suggestions: input.suggestions
        });
        return { success: true, message: 'Suggestions updated successfully.' };
      }

      return { success: false, message: 'No action taken.' };

    } catch (error) {
      console.error('Error updating co-pilot session:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      throw new Error(`Failed to update co-pilot session: ${errorMessage}`);
    }
  }
);
