'use server';

/**
 * @fileOverview Implements voice input functionality for interacting with the AI.
 *
 * - enableVoiceInput - A function to convert voice input to text.
 * - EnableVoiceInputInput - The input type for the enableVoiceInput function.
 * - EnableVoiceInputOutput - The return type for the enableVoiceInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnableVoiceInputInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EnableVoiceInputInput = z.infer<typeof EnableVoiceInputInputSchema>;

const EnableVoiceInputOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio input.'),
});
export type EnableVoiceInputOutput = z.infer<typeof EnableVoiceInputOutputSchema>;

export async function enableVoiceInput(input: EnableVoiceInputInput): Promise<EnableVoiceInputOutput> {
  return enableVoiceInputFlow(input);
}

const voiceInputPrompt = ai.definePrompt({
  name: 'voiceInputPrompt',
  input: {schema: EnableVoiceInputInputSchema},
  output: {schema: EnableVoiceInputOutputSchema},
  prompt: `You are a transcription service. Transcribe the following audio data to text.\n\nAudio: {{media url=audioDataUri}}`,
});

const enableVoiceInputFlow = ai.defineFlow(
  {
    name: 'enableVoiceInputFlow',
    inputSchema: EnableVoiceInputInputSchema,
    outputSchema: EnableVoiceInputOutputSchema,
  },
  async input => {
    const {output} = await voiceInputPrompt(input);
    return output!;
  }
);
