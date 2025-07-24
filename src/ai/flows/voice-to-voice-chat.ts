
'use server';

/**
 * @fileOverview A Genkit flow for a seamless voice-to-voice chat experience.
 * It transcribes user audio, gets a text response from the AI, and generates speech for that response.
 *
 * - voiceToVoiceChat - The main function for the voice-to-voice interaction.
 * - VoiceToVoiceChatInput - The input type for the voiceToVoiceChat function.
 * - VoiceToVoiceChatOutput - The return type for the voiceToVoiceChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { enableVoiceInput } from './enable-voice-input';
import { analyzeUserInput } from './analyze-user-input';
import { generateAudio } from './generate-audio';

const VoiceToVoiceChatInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The user's speech as an audio data URI, including MIME type and Base64 encoding."
    ),
  voiceName: z.string().optional().describe('The voice to use for the AI response.'),
   characterDetails: z.object({
      name: z.string(),
      personality: z.string(),
      backstory: z.string(),
    }).optional().describe('The details of the active AI character persona.'),
});
type VoiceToVoiceChatInput = z.infer<typeof VoiceToVoiceChatInputSchema>;

const VoiceToVoiceChatOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the user\'s audio.'),
  responseText: z.string().describe('The AI\'s text response.'),
  audioDataUri: z.string().describe("The AI's audio response as a data URI."),
});
type VoiceToVoiceChatOutput = z.infer<typeof VoiceToVoiceChatOutputSchema>;

export async function voiceToVoiceChat(input: VoiceToVoiceChatInput): Promise<VoiceToVoiceChatOutput> {
  return voiceToVoiceChatFlow(input);
}

const voiceToVoiceChatFlow = ai.defineFlow(
  {
    name: 'voiceToVoiceChatFlow',
    inputSchema: VoiceToVoiceChatInputSchema,
    outputSchema: VoiceToVoiceChatOutputSchema,
  },
  async ({ audioDataUri, voiceName, characterDetails }) => {
    // Step 1: Transcribe the user's voice input to text.
    const { transcription } = await enableVoiceInput({ audioDataUri });

    if (!transcription) {
      throw new Error('Failed to transcribe user audio.');
    }

    // Step 2: Get a text and audio response from the AI based on the transcription.
    // The analyzeUserInput flow is already set up to generate both text and audio.
    const { analysisResult, audioDataUri: responseAudio } = await analyzeUserInput({
      textPrompt: transcription,
      voiceName: voiceName,
      characterDetails: characterDetails,
    });

    if (!analysisResult || !responseAudio) {
      throw new Error('Failed to get a valid response from the AI.');
    }

    // Step 3: Return all parts of the conversation.
    return {
      transcription,
      responseText: analysisResult,
      audioDataUri: responseAudio,
    };
  }
);
