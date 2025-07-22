// src/ai/flows/analyze-user-input.ts
'use server';

/**
 * @fileOverview Analyzes user input consisting of text, photos, and videos to provide relevant and accurate responses.
 *
 * - analyzeUserInput - A function that handles the analysis of user input.
 * - AnalyzeUserInputInput - The input type for the analyzeUserInput function.
 * - AnalyzeUserInputOutput - The return type for the analyzeUserInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { generateAudio } from './generate-audio';

const AnalyzeUserInputInputSchema = z.object({
  textPrompt: z.string().optional().describe('The text prompt from the user.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo from the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  videoDataUri: z
    .string()
    .optional()
    .describe(
      "A video from the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

export type AnalyzeUserInputInput = z.infer<typeof AnalyzeUserInputInputSchema>;

const AnalyzeUserInputOutputSchema = z.object({
  analysisResult: z.string().describe('The analysis result of the user input.'),
  audioDataUri: z.string().optional().describe("The audio response as a data URI."),
});

export type AnalyzeUserInputOutput = z.infer<typeof AnalyzeUserInputOutputSchema>;

export async function analyzeUserInput(input: AnalyzeUserInputInput): Promise<AnalyzeUserInputOutput> {
  return analyzeUserInputFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeUserInputPrompt',
  input: {schema: AnalyzeUserInputInputSchema},
  output: {schema: z.object({
    analysisResult: z.string().describe('The analysis result of the user input.'),
  })},
  prompt: `You are an AI assistant designed to analyze user input and provide relevant responses.\n\nYou will receive text, photo, and video prompts from the user. Analyze the provided information and generate a comprehensive analysis result.\n\nHere's the user input:\n\n{{#if textPrompt}}
Text Prompt: {{{textPrompt}}}
{{/if}}

{{#if photoDataUri}}
Photo: {{media url=photoDataUri}}
{{/if}}

{{#if videoDataUri}}
Video: Analyzing video content is beyond the current capabilities.  The user provided a video.  Please acknowledge that it was received, but it will not be analyzed.
{{/if}}
\nBased on the information, provide a detailed analysis.\n`,
});

const analyzeUserInputFlow = ai.defineFlow(
  {
    name: 'analyzeUserInputFlow',
    inputSchema: AnalyzeUserInputInputSchema,
    outputSchema: AnalyzeUserInputOutputSchema,
  },
  async input => {
    const [{ output: textOutput }, audioOutput] = await Promise.all([
        prompt(input),
        generateAudio(input.textPrompt || "I have received your media but no text prompt.")
    ]);
    
    if (!textOutput) {
        throw new Error('Failed to generate text response.');
    }

    return {
      analysisResult: textOutput.analysisResult,
      audioDataUri: audioOutput.media,
    };
  }
);
