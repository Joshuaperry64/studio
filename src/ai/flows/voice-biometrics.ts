// src/ai/flows/voice-biometrics.ts
'use server';

/**
 * @fileOverview A Genkit flow for voice biometrics, including speaker diarization.
 *
 * - voiceBiometrics - A function that transcribes audio and identifies different speakers.
 * - VoiceBiometricsInput - The input type for the voiceBiometrics function.
 * - VoiceBiometricsOutput - The return type for the voiceBiometrics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VoiceBiometricsInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
type VoiceBiometricsInput = z.infer<typeof VoiceBiometricsInputSchema>;

const VoiceBiometricsOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text with speaker labels.'),
});
type VoiceBiometricsOutput = z.infer<typeof VoiceBiometricsOutputSchema>;

export async function voiceBiometrics(input: VoiceBiometricsInput): Promise<VoiceBiometricsOutput> {
  return voiceBiometricsFlow(input);
}

const voiceBiometricsPrompt = ai.definePrompt({
  name: 'voiceBiometricsPrompt',
  input: {schema: VoiceBiometricsInputSchema},
  output: {schema: VoiceBiometricsOutputSchema},
  prompt: `You are a highly advanced transcription and speaker diarization service.
Your task is to transcribe the provided audio and differentiate between the speakers.
Prefix each part of the conversation with "Speaker 1:", "Speaker 2:", etc.

Audio for analysis: {{media url=audioDataUri}}`,
  config: {
    // Diarization is a feature of more advanced speech models.
    // We are pointing to a hypothetical model config that would enable it.
    // In a real scenario, you'd select a model that explicitly supports this.
    model: 'googleai/gemini-2.5-flash-preview', // Example model
    diarization_config: {
        enable_speaker_diarization: true,
        min_speaker_count: 1,
        max_speaker_count: 5,
    },
  }
});


const voiceBiometricsFlow = ai.defineFlow(
  {
    name: 'voiceBiometricsFlow',
    inputSchema: VoiceBiometricsInputSchema,
    outputSchema: VoiceBiometricsOutputSchema,
  },
  async input => {
    const {output} = await voiceBiometricsPrompt(input);
    return output!;
  }
);
